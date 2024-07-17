// All Rights Reserved.
// Github: https://github.com/electronicsguy

var SS = SpreadsheetApp.openById('1k56KIS2q_07G4E5_XK3pnT_U33DqlmRvySdTY-wtpN4');    //Enter Your Sheet ID Got From Sheet URL Link
var sheet = SS.getSheetByName('Data_Sheet');      // Enter your sheet name here

function onOpen(){
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('NodeMCU_logger')
  .addItem('Clear', 'Clear')
  .addToUi();
}

function Clear(){
  sheet.deleteRows(4, sheet.getLastRow());
  SS.toast('Chart cleared', 'NodeMCU_logger', 5);
}

function doPost(e) {
  var parsedData;
  
  try { 
    parsedData = JSON.parse(e.postData.contents);
  } 
  catch(f){
    return ContentService.createTextOutput("Error in parsing request body: " + f.message);
  }
   
  if (parsedData !== undefined){
    var tmp = SS.getSheetByName(parsedData.sheet_name);

    // Current date and time
    var d = new Date();
    var dateStr = Utilities.formatDate(d, Session.getScriptTimeZone(), "yyyy-MM-dd");
    var timeStr = Utilities.formatDate(d, Session.getScriptTimeZone(), "HH:mm:ss");
    
 // Create array for values
    var dataArr = [dateStr, timeStr];
    
    // Assuming parsedData.values is a string of comma-separated values
    var sensorValues = parsedData.values.split(",");
    dataArr = dataArr.concat(sensorValues);

    tmp.appendRow(dataArr);
    
    SpreadsheetApp.flush();
    return ContentService.createTextOutput("Success");
  } else {
    return ContentService.createTextOutput("Error! Request body empty or in incorrect format.");
  }
}

function doGet(e){
  var val = e.parameter.value;
  var cal = e.parameter.cal;
  var read = e.parameter.read;
  
  if (cal !== undefined){
    return ContentService.createTextOutput(GetEventsOneWeek());
  }
  
  if (read !== undefined){
    var count = (sheet.getRange('C1').getValue()) + 1;
    sheet.getRange('C1').setValue(count);
    return ContentService.createTextOutput(sheet.getRange('A1').getValue());
  }
  
  if (e.parameter.value === undefined)
    return ContentService.createTextOutput("No value passed as argument to script Url.");
    
  var range = sheet.getRange('A1');
  var retval = range.setValue(val).getValue();
  var now = Utilities.formatDate(new Date(), "EST", "yyyy-MM-dd'T'hh:mm a'Z'").slice(11,19);
  sheet.getRange('B1').setValue("Humidity");
  
  if (retval == e.parameter.value)
    return ContentService.createTextOutput("Successfully wrote: " + e.parameter.value + "\ninto spreadsheet.");
  else
    return ContentService.createTextOutput("Unable to write into spreadsheet.\nCheck authentication and make sure the cursor is not on cell 'A1'." + retval + ' ' + e.parameter.value);
}

function GetEventsOneWeek(){
  var Cal = CalendarApp.getCalendarsByName('Test REST API')[0];
  var Now = new Date();
  var OneWeekFromNow = new Date();
  OneWeekFromNow.setDate(Now.getDate() + 7);
  var events = Cal.getEvents(Now, OneWeekFromNow);
  var str = '\nEvent Title,\tDescription,\tRecurring?,\tAll-day?,\tFirst Reminder (in minutes before event)\n';
  for (var i = 0; i < events.length; i++){
    str += events[i].getTitle() + ',\t' + events[i].getDescription() + ',\t' + events[i].isRecurringEvent() +  ',\t' + events[i].isAllDayEvent() + ',\t' + events[i].getPopupReminders()[0];
    str += '\n';
  }
  return str;
}
