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
     const dateList = document.querySelector('.date-list');
     const prevButton = document.querySelector('.date-nav.prev');
     const nextButton = document.querySelector('.date-nav.next');
     const selectedTimesContainer = document.getElementById('selectedTimes');
     let currentWeekStart = new Date();
     currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay() + 1); // Start from Monday
     let selectedDate = null;
     const selectedTimes = [];
 
     function generateDateItems(startDate) {
       dateList.innerHTML = '';
       const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
       const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
       
       for (let i = 0; i < 7; i++) {
         const date = new Date(startDate);
         date.setDate(startDate.getDate() + i);
         if (date.getDay() !== 0 && date.getDay() !== 6) { // Exclude weekends
           const dateItem = document.createElement('div');
           dateItem.classList.add('date-item');
           dateItem.dataset.date = date.toISOString().split('T')[0];
           dateItem.innerHTML = `
             <span class="day">${days[date.getDay()]}</span>
             <span class="date">${date.getDate()}</span>
             <span class="month">${months[date.getMonth()]}</span>
           `;
           dateList.appendChild(dateItem);
         }
       }
       
       addDateItemListeners();
       updateNavigationButtons();
     }
 
     function addDateItemListeners() {
       const dateItems = document.querySelectorAll('.date-item');
       dateItems.forEach(item => {
         item.addEventListener('click', function() {
           if (this.classList.contains('selected')) {
             this.classList.remove('selected');
             selectedDate = null;
           } else {
             dateItems.forEach(di => di.classList.remove('selected'));
             this.classList.add('selected');
             selectedDate = this.dataset.date;
           }
           updateSelectedTimes();
         });
       });
     }
 
     function updateNavigationButtons() {
       const today = new Date();
       today.setHours(0, 0, 0, 0);
       prevButton.style.display = currentWeekStart > today ? 'block' : 'none';
       nextButton.style.display = 'block';
     }
 
     prevButton.addEventListener('click', () => {
       currentWeekStart.setDate(currentWeekStart.getDate() - 7);
       generateDateItems(currentWeekStart);
     });
 
     nextButton.addEventListener('click', () => {
       currentWeekStart.setDate(currentWeekStart.getDate() + 7);
       generateDateItems(currentWeekStart);
     });
 
     generateDateItems(currentWeekStart);
 
     const timeSlots = document.querySelectorAll('.time-slot');
     timeSlots.forEach(slot => {
       slot.addEventListener('click', function() {
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
           selectedTimes.push(`${selectedDate} ${time}`);
         });
       }
 
       selectedTimesContainer.innerHTML = '';
       selectedTimes.forEach(time => {
         const [date, slotTime] = time.split(' ');
         const formattedDate = new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
         const tag = document.createElement('span');
         tag.classList.add('selected-time-tag');
         tag.innerHTML = `${formattedDate} ${slotTime} <button class="remove-time" data-time="${time}">&times;</button>`;
         selectedTimesContainer.appendChild(tag);
       });
     }
 
     selectedTimesContainer.addEventListener('click', function(e) {
       if (e.target.classList.contains('remove-time')) {
         const time = e.target.dataset.time;
         const index = selectedTimes.indexOf(time);
         if (index > -1) {
           selectedTimes.splice(index, 1);
         }
         const [date, slotTime] = time.split(' ');
         const slot = document.querySelector(`.time-slot[data-time="${slotTime}"]`);
         if (slot) slot.classList.remove('selected');
         updateSelectedTimes();
       }
     });
 
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