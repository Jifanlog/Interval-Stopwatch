# Countdown Phases App

## Overview
The Countdown Phases App is a web application designed to help users manage and track countdown phases with customizable timers. Users can add multiple phases, each containing timers that can be set for work or rest periods. The app also features a wake lock functionality to prevent the screen from sleeping during active timers.

## Project Structure
The project consists of the following files:

- `index.html`: Contains the HTML structure of the application, including the layout for countdown phases, control buttons, and a section for displaying the running timer. It links to the external CSS and JavaScript files.
  
- `styles.css`: Contains the CSS styles for the application, defining the styles for the body, phase containers, timer displays, buttons, and other UI elements to ensure a visually appealing layout.
  
- `script.js`: Contains the JavaScript code for the application, handling the functionality for adding phases, managing timers, saving and loading phases from local storage, and controlling the wake lock feature. It also includes functions for starting, stopping, and resetting the timers.

## Features
- Add multiple countdown phases with customizable timers.
- Set timers for work and rest periods, each represented by an emoji.
- Save and load phases from local storage.
- Prevent screen sleep during active timers using the wake lock feature.
- Start, stop, and reset timers easily.

## Usage
1. Open `index.html` in a web browser.
2. Use the "Add Phase" button to create new phases.
3. For each phase, set the timer type (Work or Rest), minutes, and seconds.
4. Click "Start" to begin the countdown.
5. Use the "Stop" and "Reset" buttons to control the timers as needed.

## Requirements
- A modern web browser that supports JavaScript and the Wake Lock API.

## License
This project is open-source and available for anyone to use and modify.