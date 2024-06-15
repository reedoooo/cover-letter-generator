# Cover Letter Generator

## Overview

The Cover Letter Generator is a Node.js application designed to help users create customized cover letters efficiently. This project utilizes Express.js to handle server-side logic and integrates various other technologies to streamline the generation process.

## Table of Contents

1. [Cover Letter Generator](#cover-letter-generator)
	1. [Overview](#overview)
	2. [Table of Contents](#table-of-contents)
	3. [Getting Started](#getting-started)
		1. [Prerequisites](#prerequisites)
		2. [Installation](#installation)
		3. [Environment Setup](#environment-setup)
	4. [Usage](#usage)
		1. [Running the Server](#running-the-server)
		2. [Generating a Cover Letter](#generating-a-cover-letter)
	5. [Project Structure](#project-structure)
	6. [Scripts](#scripts)
	7. [Contributing](#contributing)
	8. [License](#license)

## Getting Started

### Prerequisites

Make sure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (version 14 or higher recommended)
- [npm](https://www.npmjs.com/) (Node package manager)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/cover-letter-generator.git
   ```

2. Navigate to the project directory:

   ```bash
   cd cover-letter-generator
   ```

3. Install the dependencies:

   ```bash
   npm install
   ```

### Environment Setup

Create a `.env` file in the root directory and configure the necessary environment variables:

    ```env
    PORT=3000
    DB_URI=mongodb://localhost:27017/coverLetterGenerator
    JWT_SECRET=your_jwt_secret
    ```

## Usage

### Running the Server

To start the server in development mode:

```bash
npm run dev
```

To start the server in production mode:

```bash
npm start
```

The server will be running at `http://localhost:3000`.

### Generating a Cover Letter

1. **Create a User Account**: Sign up for an account using the `/api/user/signup` endpoint.

2. **Log In**: Log in to your account using the `/api/user/login` endpoint.

3. **Generate a Cover Letter**: Use the `/api/cover-letter/create` endpoint to generate a cover letter. Provide the following parameters in the request body:

   - `jobTitle`: The title of the job you are applying for.
   - `companyName`: The name of the company you are applying to.
   - `companyAddress`: The address of the company.
   - `companyCity`: The city where the company is located.
   - `companyState`: The state where the company is located.
   - `companyZip`: The ZIP code of the company.
   - `companyCountry`: The country where the company is located.
   - `salutation`: The salutation for the cover letter.
   - `openingParagraph`: The opening paragraph of the cover letter.
   - `bodyParagraphs`: An array of body paragraphs for the cover letter.
   - `closingParagraph`: The closing paragraph of the cover letter.
   - `signature`: The signature for the cover letter.

## Project Structure

The cover letter generator is organized into the following files:

```ascii
📁 src/
├── 📁 __test__/                         // TESTS:
│   ├── aiService.test.js                //
│   ├── ...                              //
├── app.js                               //
├── 📁 config/                           // CONFIG DIR:
│   ├── database.js                      // | DATABASE CONFIG:
│   ├── 📁 env/                          // ENVIRONMENT DIR:
│   ├── index.js                         //
│   │   ├── development.js               //    [DEV][]
│   │   ├── production.js                //    [PROD][]
│   │   ├── test.js                      //    [TEST][]
│   ├── 📁 logs/                         // LOGS DIR: log files
<!--│   ├── 📁 passport/                 //
│   │   ├── local.js                     //
│   ├── passport.js                      // -->
│   ├── winston.js                       // LOGGER CONFIG:
├── 📁 controllers/                      // CONTROLLERS DIR:
│   ├── coverLetterController.js         //    [COVERLETTER][]
│   ├── userController.js                //    [USER][]
├── 📁 generated/                        // GENERATED DIR: Static PDF files generated by openAi chat
│   ├── cover_letter.pdf                 //
│   ├── ...                              //
├── 📁 middlewares/                      // MIDWARE DIR:
│   ├── index.js                         // Middleware setup file
│   ├── morganMiddleware.js              //    | Morgan: HTTP request logger middleware
│   ├── unifiedErrorHandler.js           //    | Error Handling: handles errors for each route
│   ├── validationMiddleware.js          //    | Validation: validates REST API requests for cover letter drafts and users
├── 📁 models/                           // MODELS DIR: mongoose schemas and models
│   ├── User.js                          //    | USER: {name, email, password, coverLetters}
├── 📁 routes/                           // ROUTES DIR:
│   ├── index.js                         // | ./api: {cover-letter, user}
│   ├── coverLetterRoutes.js             //    | ./cover-letter: {create, save, update, delete, get}
│   ├── userRoutes.js                    //    | ./user: {signup, login, logout, validate-token}
├── 📁 services/                         // SERVICES DIR: Chat GPT is used crystallize a pool of amalgamated by a linkedIn data scraper and pdfTextExtractor
│   ├── aiService.js                     //    | AI: {chatGPT}
├── setupTests.js                        //
├── 📁 utils/                            // UTILITIES DIR:
│   ├── index.js                         //
│   ├── dataUtilities.js                 //    [DATA]['linkedInDataScraper()']
│   ├── fileConversionUtilities.js       //    [FILE]['createCoverLetterHtml()', 'createDraftState()']
│   ├── genUtilities.js                  //    [GEN]['splitTextDocuments', 'extractTextFromUrl', 'convertDraftContentStateToPlainText', convertToRegularObject, │   ├──                                  //          'replacePlaceholders', 'replaceUnsupportedCharacters']
│   ├── openAiUtilities.js               //    [OPENAI]['getOpenaiClient', 'createPrompt', 'fetchOpenAIResponse']
│   ├── pdfUtilities.js                  //    [PDF]['generatePDF', 'savePDF', 'loadPDF']
```

## Scripts

- `start`: Runs the application in production mode
- `dev`: Runs the application in development mode
- `prod`: Runs the application in production mode
- `build`: Compiles the source code using Babel
- `test`: Runs tests using Jest
- `lint`: Lints the code using ESLint
- `lint:fix`: Fixes linting issues
- `prettify`: Formats the code using Prettier

```json
{
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "prod": "cross-env NODE_ENV=production node index.js",
    "build": "babel src --out-dir dist --copy-files",
    "test": "jest src/**/*.test.js --coverage --verbose --runInBand --detectOpenHandles",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "prettify": "prettier --write ."
  }
}
```

## Contributing

We welcome contributions to enhance the Cover Letter Generator. Please fork the repository, create a new branch, and submit a pull request with your changes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
