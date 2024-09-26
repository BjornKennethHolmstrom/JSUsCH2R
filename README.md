# JSUsCH²R (JavaScript Unicode Symbol Clock Hourly Habit Representation)

## Overview

JSUsCH²R is a fun and interactive web application that represents daily activities using Unicode emojis. It allows users to visualize their weekly schedule in a unique and engaging way.

Created by [Björn Kenneth Holmström](https://bjornkennethholmstrom.wordpress.com)

## Features

- Week-long schedule representation using emojis
- 10 customizable color themes, including Dark Mode
- Time allocation chart for daily and weekly analysis
- Social sharing of schedules
- Customizable emoji library
- Real-time clock display
- Swipe or button to toggle time information display
- Select week starting day (Monday or Sunday)
- Help modal for easy onboarding
- Responsive design for various screen sizes
- PWA support for mobile-friendly usage
- Persistent storage of schedule and preferences
- Ability to reset/delete libraries
- Improved error handling and user feedback

## Getting Started

### Prerequisites

- Node.js (v12 or later)
- npm (usually comes with Node.js)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/BjornKennethHolmstrom/JSUsCH2R.git
   cd JSUsCH2R
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. In a separate terminal, start the API server:
   ```
   node server/jsusch2r.js
   ```

5. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Usage

- Navigate through the week using the day tabs.
- Click on any emoji in the schedule to edit the activity for that hour.
- Use the Emoji Library to add or remove emojis for quick selection.
- Explore different themes in the theme selector.
- Analyze your time allocation using the built-in chart.
- Share your schedule using the share feature.
- Reset or delete your library if needed.
- Your changes are automatically saved to the server.

## Building for Production

To create a production build, run:

```
npm run build
```

This will create a `build` directory with optimized production-ready files.

For deployment to GitHub Pages, run:

```
npm run deploy
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is published under a custom license (see LICENSE.md).

## Acknowledgments

- This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
- Emoji designs are provided by the Unicode Consortium.
- Claude A.I. for development assistance
- My family for support and infrastructure
