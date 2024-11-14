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
- PostgreSQL database

### Environment Setup

1. Create a `.env` file in the root directory with the following variables:
```
DB_USER=your_db_user
DB_HOST=localhost
DB_NAME=jsusch2r_db
DB_PASSWORD=your_db_password
DB_PORT=5432
JWT_SECRET=your_jwt_secret
PORT=3001
```

### Installation

1. Clone the repository:
```bash
git clone https://github.com/BjornKennethHolmstrom/JSUsCH2R.git
cd JSUsCH2R
```

2. Install dependencies:
```bash
npm install
```

### Running the Application

You can run both the client and server concurrently using:
```bash
npm run dev
```

Or run them separately:

1. Start the server:
```bash
npm run server
# or for development with auto-reload:
npm run server:dev
```

2. In a new terminal, start the client:
```bash
npm start
```

The client will be available at [http://localhost:3000](http://localhost:3000)
The server will run on [http://localhost:3001](http://localhost:3001)

### Testing

Run client-side tests:
```bash
npm test
```

Run server-side tests:
```bash
npm run test:server
```

Run all tests with coverage:
```bash
npm run test:all
```

## Building for Production

To create a production build:
```bash
npm run build
```

For deployment to GitHub Pages:
```bash
npm run deploy
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is published under a custom license (see LICENSE.md).

## Acknowledgments

- This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app)
- Emoji designs are provided by the Unicode Consortium
- Claude A.I. for development assistance
- My family for support and infrastructure
