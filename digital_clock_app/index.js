const HOURS_ELEMENT = document.getElementById("hours");
const MINUTES_ELEMENT = document.getElementById("minutes");
const SECONDS_ELEMENT = document.getElementById("seconds");
const AMPM_ELEMENT = document.getElementById("ampm");

function updateClock() {
  let hours = new Date().getHours();
  let minutes = new Date().getMinutes();
  let seconds = new Date().getSeconds();
  let ampm = new Date().getHours();

  if (hours > 12) {
    hours -= 12;
    ampm = "PM";
  }

  HOURS_ELEMENT.innerText = hours;
  MINUTES_ELEMENT.innerText = minutes;
  SECONDS_ELEMENT.innerText = seconds;
  AMPM_ELEMENT.innerText = ampm;
  setTimeout(() => {
    updateClock();
  }, 1000);
}

updateClock();
