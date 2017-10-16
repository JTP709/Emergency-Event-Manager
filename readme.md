
# Emergency Event Manager for Udacity Full-Stack Nanodegree Program

### Author: Jonathan Prell
### v1.0 - 10/16/2017
_________________________________________________________________

## Changelog:

v1.0 - Initial Release
_________________________________________________________________

## About:

The Emergency Event manager satisfies the Neighborhood Map project for Unit 4 in the Udacity Full Stack Nanodegere program.

This application provides an emergency management team or Incident Command Staff a map-based application to visually log and track individual emergency events as they unfold.

An Emergency Manger or Incident Coordinator can create and update new events, filter events based on the incident category, and declare an event "All Clear!" which removes the event from the actie view.

The application uses the powerful [Google Maps JavaScript API.](https://developers.google.com/maps/documentation/javascript/)

The application takes advantage of a simple and free open weather API from [Open Weather Map](https://openweathermap.org/api) to provide the user current weather information. The weather currently provides local information for my location in Cincinnati, OH.
_________________________________________________________________

## How to Use:

The main page will open on the "Emergenc Events" tab. The left side of the page will list all of the active Events while the map view on the right will display the event's locations with custom icons.

Each event has it's own "card" displayed on the left side-bar. These cards provide basic information about the event, such as the incident Type, Casualty Level, number of Casualties, and PPE (personal proetective equipment) requirements. Buttons at the bottom of the card allow the user to GO TO the even, which zooms in closer on the map view, edit the existing event information, or declaring an "All Clear" which removes the event from the active list. Hovering over a card will highlight the map icon in the map view to show the user where the event is located.

When a user zooms into an event, additional markers for that event will appear. These will indicate more event specific locations, such as the local Command Post, Assembly Point, and Decontamination area. These markers may not always be applicable. A red circle will also appear, indicating the event's Hot Zone, or immediate danger area. Again, these are only present if applicable.

A user may filter both the events in the active list and the map view by click on the "List Filters" button at the top of the side-bar. Once you have selected the event listings you wish to view, it is recommended to click the "Reset Map" button at the top of the screen, which will reset the map bounds based on the visible markers, just in case an event you wish to view is not immediatly visible within the bounds of the map.

To edit an active event, simply click in "edit" button in the event's card. This will zoom in to the event, and open up drop down menus for the current information on the dab card for the user to change. A user may also drag the markers to new locations, and preview any new hotzone radius settings.
* Please note: all radius markers are measured in meters.

To create a new event, click the "New Emergency" button at the top of ths creen (or in the menu drop down on mobile devices). Input the appropriate information into each field and place an Event Location marker on the map. Only the Event Location marker is required.
_________________________________________________________________

## Installation:

Simply open 'index.html' in your web browser of choice.

_________________________________________________________________

## Free online icons used:

* [Maps Icons Collection](https://mapicons.mapsmarker.com)