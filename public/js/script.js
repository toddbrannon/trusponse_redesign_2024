document.addEventListener('DOMContentLoaded', function() {
  // Smooth scrolling for nav links
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetSection = document.querySelector(targetId);
      if (targetSection) {
        targetSection.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });

  // Service Selection Page Scripts
  const serviceSelectionForm = document.getElementById('serviceSelectionForm');
  if (serviceSelectionForm) {
    const { DateTime } = luxon; // Import luxon for date handling
    const dateList = document.querySelector('.date-list');
    const prevButton = document.querySelector('[data-prev-button]');
    const nextButton = document.querySelector('.date-nav.next');
    const selectedTimesContainer = document.getElementById('selectedTimes');
    const timezoneSelect = document.getElementById('timezone-select');

    let currentWeekStart = new Date();
    currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay() + 1); // Start from Monday
    let selectedDate = null;
    let userTimezone = 'America/Chicago'; // Default to Central Time
    const selectedTimes = [];

    // Simplified timezone list
    const simplifiedTimezones = [
      { value: 'America/Chicago', label: 'Central Time (Chicago)' },
      { value: 'America/New_York', label: 'Eastern Time (New York)' },
      { value: 'America/Los_Angeles', label: 'Pacific Time (Los Angeles)' },
      { value: 'America/Denver', label: 'Mountain Time (Denver)' },
      { value: 'America/Anchorage', label: 'Alaska Time (Anchorage)' },
      { value: 'Pacific/Honolulu', label: 'Hawaii-Aleutian Time (Honolulu)' },
      { value: 'America/Toronto', label: 'Eastern Time (Toronto)' },
      { value: 'Europe/London', label: 'GMT (London)' },
      { value: 'Europe/Berlin', label: 'CET (Berlin)' },
      { value: 'Asia/Tokyo', label: 'JST (Tokyo)' },
      // Add more as needed
    ];

    // Populate timezone select
    function populateTimezoneSelect() {
      simplifiedTimezones.forEach(tz => {
        const option = document.createElement('option');
        option.value = tz.value;
        option.textContent = tz.label;
        if (tz.value === userTimezone) {
          option.selected = true;
        }
        timezoneSelect.appendChild(option);
      });
    }

    populateTimezoneSelect();

    timezoneSelect.addEventListener('change', function() {
      userTimezone = this.value;
      updateDateItems(currentWeekStart);
    });

    function updateDateItems(startDate) {
      dateList.innerHTML = '';
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        
        // Exclude weekends
        if (date.getDay() === 0 || date.getDay() === 6) continue;

        const dateItem = document.createElement('div');
        dateItem.classList.add('date-item');
        dateItem.dataset.date = date.toISOString().split('T')[0];

        // Check if the date is in the past
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (date < today) {
          dateItem.classList.add('disabled'); // Grey out past dates
          dateItem.style.pointerEvents = "none"; // Prevent selection
        }

        const centralDate = DateTime.fromJSDate(date).setZone('America/Chicago');
        const userDate = DateTime.fromJSDate(date).setZone(userTimezone);

        dateItem.innerHTML = `
          <span class="day">${userDate.toFormat('ccc')}</span>
          <span class="date">${userDate.toFormat('d')}</span>
          <span class="month">${userDate.toFormat('LLL')}</span>
          <span class="timezone-info">
            ${centralDate.toFormat('t')} CT / ${userDate.toFormat('t')} ${userDate.toFormat('ZZZZ')}
          </span>
        `;

        // Check if this date is today
        if (date.toISOString().split('T')[0] === today.toISOString().split('T')[0]) {
          dateItem.classList.add('current-date'); // Add a class for today's date
        }

        dateList.appendChild(dateItem);
      }

      addDateItemListeners();
      updateNavigationButtons();
    }

    function addDateItemListeners() {
      const dateItems = document.querySelectorAll('.date-item');
      dateItems.forEach(item => {
        item.addEventListener('click', function() {
          if (!this.classList.contains('disabled')) { // Prevent selection of disabled dates
            dateItems.forEach(di => di.classList.remove('selected'));
            this.classList.add('selected');
            selectedDate = this.dataset.date;
            updateTimeSlotState(); // Update time slot state based on selected date
            updateSelectedTimes();
          }
        });
      });
    }

    function updateNavigationButtons() {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Show prevButton if the first day of the current rendered week is after today
      if (currentWeekStart > today) {
        prevButton.style.display = 'inline-block';
      } else {
        prevButton.style.display = 'none';
      }
     
      // nextButton is always visible
      nextButton.style.display = 'inline-block';
    }

    prevButton.addEventListener('click', () => {
      currentWeekStart.setDate(currentWeekStart.getDate() - 7);
      updateDateItems(currentWeekStart);
    });

    nextButton.addEventListener('click', () => {
      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
      updateDateItems(currentWeekStart);
    });

    function updateTimeSlotState() {
      timeSlots.forEach(slot => {
        if (selectedDate) {
          slot.disabled = false;
          slot.classList.remove('disabled');
        } else {
          slot.disabled = true;
          slot.classList.add('disabled');
          slot.classList.remove('selected');
        }
      });
    }

    updateDateItems(currentWeekStart);

    const timeSlots = document.querySelectorAll('.time-slot');
    timeSlots.forEach(slot => {
      slot.addEventListener('click', function() {
        if (!selectedDate) return; // Ignore clicks if no date is selected
        this.classList.toggle('selected');
        updateSelectedTimes();
      });
    });

    function updateSelectedTimes() {
      selectedTimes.length = 0; // Clear the array
      if (selectedDate) {
        const selectedSlots = document.querySelectorAll('.time-slot.selected');

        selectedSlots.forEach(slot => {
          const time = slot.dataset.time;

          // Create a DateTime object in Central Time and convert it to user's timezone
          const dateTimeCentral = DateTime.fromISO(`${selectedDate}T${time}`, { zone: 'America/Chicago' });
          const userTimeZoneTime = dateTimeCentral.setZone(userTimezone);

          selectedTimes.push({
            central: `${dateTimeCentral.toFormat("MMM d, yyyy")} ${dateTimeCentral.toFormat("t")}`, // Format as "Nov 7, 2024"
            user: `${userTimeZoneTime.toFormat("MMM d, yyyy")} ${userTimeZoneTime.toFormat("t")}`
          });
        });

        selectedTimesContainer.innerHTML = '';

        selectedTimes.forEach(time => {
          const tag = document.createElement('span');
          tag.classList.add('selected-time-tag');

          // Show the appointment time and conditionally show the date based on timezone
          tag.innerHTML = `
            ${userTimezone !== 'America/Chicago' ? time.central + " CT / " : ""}${time.user} ${userTimezone}
            <button class="remove-time" data-time="${time.central}">&times;</button>
          `;
          
          selectedTimesContainer.appendChild(tag);
          
          // Add event listener for removing appointments
          tag.querySelector('.remove-time').addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent click event from bubbling up
            
            selectedTimes.splice(selectedTimes.findIndex(t => t.central === time.central), 1);

            updateSelectedTimes();
           });
         });
       }
     
     }

     // Form submission
     serviceSelectionForm.addEventListener('submit', function(e) {
       e.preventDefault();
       const formData = new FormData(this);
       const formObject = {};
       formData.forEach((value, key) => {
         if (formObject[key]) {
           if (!Array.isArray(formObject[key])) {
             formObject[key] = [formObject[key]];
           }
           formObject[key].push(value);
         } else {
           formObject[key] = value;
         }
       });
       formObject.selectedTimes = selectedTimes; // Add selected times to form data
       console.log('Form Submission Data:', formObject);
       alert('Form submitted! Check the console for the submitted data.');
     });
   }
});