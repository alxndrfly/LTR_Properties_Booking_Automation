import React, { useState, useEffect } from 'react';
import './BookingCalendar.css';

interface BookingCalendarProps {
  propertyName: string;
  propertyLocation: string[];
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const WEEKDAYS_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const BookingCalendar: React.FC<BookingCalendarProps> = ({ propertyName, propertyLocation }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [ibizaTime, setIbizaTime] = useState('');

  // Update Ibiza time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const ibizaTimeString = now.toLocaleTimeString('en-US', {
        timeZone: 'Europe/Madrid',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      setIbizaTime(ibizaTimeString);
    };

    updateTime(); // Set initial time
    const interval = setInterval(updateTime, 1000); // Update every second

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  // Get minimum bookable date (2 days from now)
  const getMinimumDate = () => {
    const min = new Date();
    min.setDate(min.getDate() + 2);
    min.setHours(0, 0, 0, 0);
    return min;
  };

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    // Adjust getDay() so Monday is 0 instead of Sunday
    // getDay() returns 0 for Sunday, 1 for Monday, etc.
    // We want Monday to be 0, so we subtract 1 and handle Sunday (0) specially
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7;

    const days: (Date | null)[] = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add actual days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  // Check if date is selectable (at least 2 days from now)
  const isDateSelectable = (date: Date | null): boolean => {
    if (!date) return false;
    const minDate = getMinimumDate();
    return date >= minDate;
  };

  // Generate time slots (1-hour increments from 9am to 6pm)
  const generateTimeSlots = () => {
    const slots: string[] = [];
    for (let hour = 9; hour <= 18; hour++) {
      const time = `${hour.toString().padStart(2, '0')}:00`;
      slots.push(time);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();
  const calendarDays = generateCalendarDays();

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDateClick = (date: Date | null) => {
    if (date && isDateSelectable(date)) {
      setSelectedDate(date);
      setSelectedTime(null); // Reset time selection when date changes
    }
  };

  const handleTimeClick = (time: string) => {
    if (selectedDate) {
      setSelectedTime(time);
    }
  };

  const handleBooking = () => {
    if (selectedDate && selectedTime) {
      console.log('Booking confirmed:', {
        property: propertyName,
        date: selectedDate.toDateString(),
        time: selectedTime,
        timezone: 'Europe/Madrid'
      });
      // TODO: Add actual booking logic here
      alert(`Booking request submitted for ${propertyName} on ${selectedDate.toDateString()} at ${selectedTime} (Ibiza time)`);
    }
  };

  const formatDate = (date: Date) => {
    return date.getDate();
  };

  const isSameDay = (date1: Date | null, date2: Date | null): boolean => {
    if (!date1 || !date2) return false;
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  const isToday = (date: Date | null): boolean => {
    if (!date) return false;
    const today = new Date();
    return isSameDay(date, today);
  };

  return (
    <div className="booking-calendar-wrapper">
      <div className="booking-calendar-container">
        {/* Left Panel - Property Info */}
        <div className="booking-left-panel">
          <div className="property-info">
            <h1 className="booking-title">Request a Visit For</h1>
            <h2 className="property-name">{propertyName}</h2>
            <p className="location-title">Location</p>
            <p className="property-location">{propertyLocation.join(', ')}</p>
          </div>

          <div className="timezone-info">
            <div className="timezone-label">
              <span>All bookings are made in Ibiza time</span>
            </div>
            <div className="timezone-value">{ibizaTime} <span className="timezone-name">Europe/Madrid</span></div>
            <div className="booking-notice">
              Bookings must be made at least 2 days in advance.
            </div>
          </div>
        </div>

        {/* Center Panel - Calendar */}
        <div className="booking-center-panel">
          <div className="calendar-header">
            <button onClick={handlePreviousMonth} className="month-nav-btn">
              ←
            </button>
            <h3 className="calendar-month-year">
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <button onClick={handleNextMonth} className="month-nav-btn">
              →
            </button>
          </div>

          <div className="calendar-weekdays">
            {WEEKDAYS.map((day) => (
              <div key={day} className="weekday-label">
                {day}
              </div>
            ))}
          </div>

          <div className="calendar-grid">
            {calendarDays.map((date, index) => {
              const selectable = isDateSelectable(date);
              const selected = isSameDay(date, selectedDate);
              const todayDate = isToday(date);

              return (
                <div
                  key={index}
                  className={`calendar-day ${!date ? 'empty' : ''} ${!selectable ? 'disabled' : ''} ${selected ? 'selected' : ''} ${todayDate ? 'today' : ''}`}
                  onClick={() => handleDateClick(date)}
                >
                  {date && formatDate(date)}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel - Time Slots */}
        <div className="booking-right-panel">
          <h3 className="time-panel-header">
            {selectedDate
              ? `${WEEKDAYS_FULL[(selectedDate.getDay() + 6) % 7]}, ${selectedDate.getDate()}`
              : 'Select a date'}
          </h3>

          <div className="time-slots-container">
            {selectedDate ? (
              timeSlots.map((time) => (
                <button
                  key={time}
                  className={`time-slot ${selectedTime === time ? 'selected' : ''}`}
                  onClick={() => handleTimeClick(time)}
                >
                  <span className="time-dot">•</span> {time}
                </button>
              ))
            ) : (
              <p className="no-date-message">Please select a date to view available times</p>
            )}
          </div>

          {selectedDate && selectedTime && (
            <button
              className="confirm-booking-btn"
              onClick={handleBooking}
            >
              Confirm Booking
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingCalendar;
