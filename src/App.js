import logo from './logo.svg';
import './App.css';
import { Button, MenuItem, Select } from '@mui/material';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import { useEffect, useState } from 'react';
import moment from 'moment';
import axios from 'axios';
import { RRule, RRuleSet, rrulestr } from 'rrule';

function App() {

  const [count, setCount] = useState(50);
  const [calendars, setCalendars] = useState([]);
  const [infoCalendarData, setInfoCalendarData] = useState([]);
  const navigate = () => {
    window.location.href = process.env.REACT_APP_API + '/login/google/redirect/1/calendar';
  }
  const formats = {
    eventTimeRangeFormat: () => {
      return '';
    }
  };

  const localizer = momentLocalizer(moment);
  console.log('object');

  useEffect(() => {
    axios.get(process.env.REACT_APP_API + '/google/calendars').then(res => {
      if (res) {
        const calendarsArray = [];
        for (const i in calendars) {
          calendarsArray.push({ calendarId: calendars[i].calendar_id, color: calendars[i].custom_color });
        }
        setCalendars(calendarsArray);
      } 
    });
  }, [calendars]);

  useEffect(() => {
    axios.get().then(res => {
      const events = [];
      var helperResponse = JSON.parse(res.text);
      if (helperResponse.items.length > 0) {
        for (var x = 0; x < helperResponse.items.length; x++) {
          if (helperResponse.items[x].hasOwnProperty('recurrence') == true) {
            var helperDate = moment(helperResponse.items[x].start.dateTime.toString()).format('YYYYMMDD[T]HHmmss');
            var rule = RRule.fromString(helperResponse.items[x].recurrence.toString() + ';DTSTART=' + helperDate);
            var datesEvent = rule.all().toString().split(',');
            for (var i = 0; i < datesEvent.length; i++) {
              var timeStringStart = moment(helperResponse.items[x].start.dateTime.toString()).format('hh:mm:ss a');
              var timeStringEnd = moment(helperResponse.items[x].end.dateTime.toString()).format('hh:mm:ss a');
              var dateString = moment(datesEvent[i].toString()).format('YYYY-MM-DD');
              var initDate = dateString + ' ' + timeStringStart;
              var endDate = dateString + ' ' + timeStringEnd;
              events.push({
                title: helperResponse.items[x].summary.toString(),
                start: new Date(initDate.toString()),
                end: new Date(endDate.toString()),
                // customColor: color.toString(),
                description: helperResponse.items[x].hasOwnProperty('description') == true ? helperResponse.items[x].description : ''
              });
            }
          } else {
            events.push({
              title: helperResponse.items[x].summary.toString(),
              start: new Date(helperResponse.items[x].start.dateTime.toString()),
              end: new Date(helperResponse.items[x].end.dateTime.toString()),
              // customColor: color.toString(),
              description: helperResponse.items[x].hasOwnProperty('description') == true ? helperResponse.items[x].description : ''
            });
          }
        }
        // callback(events);
      }
      setInfoCalendarData(events);
    });
  }, []);


  return (
    <div className="App App-header">
      <h1>Bienvenido</h1>
      <div style={{display: 'flex'}}>
        <Select defaultValue="Lunes" style={{margin: '5px', background: 'white', color: '#353535'}}>
          <MenuItem value="Lunes">Lunes</MenuItem>
          <MenuItem value="Martes">Martes</MenuItem>
          <MenuItem value="Miercoles">Miercoles</MenuItem>
        </Select>
        <Select defaultValue="11:30 a. m." style={{margin: '5px', background: 'white', color: '#353535'}}>
          <MenuItem value="11:30 a. m.">11:30 a. m.</MenuItem>
          <MenuItem value="12:00 p. m.">12:00 p. m.</MenuItem>
          <MenuItem value="12:30 p. m.">12:30 p. m.</MenuItem>
        </Select>
      </div>
      <Button
        style={{marginTop: '25px', background: '#353535', color: 'white', border: 'solid white 2px'}}
        type="submit"
        onClick={() => navigate()}
      >
        Agendar
      </Button>
      <Calendar
        localizer={localizer}
        events={infoCalendarData.length == 0 ? [] : infoCalendarData}
        defaultView="week"
        messages={{
          next: 'Siguiente',
          previous: 'Anterior',
          today: 'Hoy',
          month: 'Mes',
          week: 'Semana',
          day: 'Día',
          noEventsInRange: 'No hay eventos programados'
        }}
        views={['day', 'week']}
        showMultiDayTimes
        startAccessor="start"
        endAccessor="end"
        eventPropGetter={event => ({
          style: {
            fontSize: '10px',
            backgroundColor: event.customColor,
            textAlign: 'center',
            alignContent: 'center',
            alignItems: 'center'
          }
        })}
        components={{
          event: CustomEvent
        }}
        formats={formats}
        min={new Date(0, 0, 0, 8)}
        max={new Date(0, 0, 0, 18)}
        tooltipAccessor={null}
      />
    </div>
  );
}

export default App;