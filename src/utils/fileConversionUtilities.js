const createCoverLetterHtml = ({
  yourName,
  jobTitle,
  companyName,
  pdfText,
  finalJobDescription,
  finalJobRequirements,
  finalQualifications,
  finalSkills,
}) => {
  return `
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        .container {
          width: 80%;
          margin: 0 auto;
          padding: 20px;
          border: 1px solid #ccc;
          border-radius: 10px;
          background-color: #f9f9f9;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .headerTitle {
          font-size: 1.2em;
          margin: 5px 0;
        }
        .resumeTitle {
          font-weight: bold;
        }
        .resumeImage {
          width: 150px;
          height: 150px;
          border-radius: 50%;
        }
        .resumeBody {
          margin-top: 20px;
        }
        .resumeBodyTitle {
          font-size: 1.4em;
          margin-bottom: 10px;
        }
        .resumeBodyContent {
          margin-bottom: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <header class="header">
          <div>
            <h1>${yourName}</h1>
            <p class="resumeTitle headerTitle">${jobTitle}</p>
            <p class="resumeTitle">${companyName}</p>
          </div>
        </header>
        <div class="resumeBody">
          <div>
            <h2 class="resumeBodyTitle">PROFILE SUMMARY</h2>
            <p class="resumeBodyContent">${pdfText}</p>
          </div>
          <div>
            <h2 class="resumeBodyTitle">JOB DESCRIPTION</h2>
            <p class="resumeBodyContent">${finalJobDescription}</p>
          </div>
          <div>
            <h2 class="resumeBodyTitle">RESPONSIBILITIES</h2>
            <p class="resumeBodyContent">${finalJobRequirements}</p>
          </div>
          <div>
            <h2 class="resumeBodyTitle">QUALIFICATIONS</h2>
            <p class="resumeBodyContent">${finalQualifications}</p>
          </div>
          <div>
            <h2 class="resumeBodyTitle">SKILLS</h2>
            <p class="resumeBodyContent">${finalSkills}</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};
function createDraftContentState({
  yourName,
  jobTitle,
  companyName,
  pdfText,
  finalJobDescription,
  finalJobRequirements,
  finalQualifications,
  finalSkills,
}) {
  return {
    entityMap: {},
    blocks: [
      { key: "1", text: yourName, type: "header-one", depth: 0 },
      {
        key: "2",
        text: jobTitle,
        type: "header-two",
        depth: 0,
        inlineStyleRanges: [
          { offset: 0, length: jobTitle?.length, style: "BOLD" },
        ],
      },
      {
        key: "3",
        text: companyName,
        type: "header-two",
        depth: 0,
        inlineStyleRanges: [
          { offset: 0, length: companyName?.length, style: "BOLD" },
        ],
      },
      {
        key: "4",
        text: "PROFILE SUMMARY",
        type: "header-two",
        depth: 0,
        inlineStyleRanges: [
          { offset: 0, length: "PROFILE SUMMARY".length, style: "BOLD" },
        ],
      },
      { key: "5", text: pdfText, type: "unstyled", depth: 0 },
      {
        key: "6",
        text: "JOB DESCRIPTION",
        type: "header-two",
        depth: 0,
        inlineStyleRanges: [
          { offset: 0, length: "JOB DESCRIPTION".length, style: "BOLD" },
        ],
      },
      { key: "7", text: finalJobDescription, type: "unstyled", depth: 0 },
      {
        key: "8",
        text: "RESPONSIBILITIES",
        type: "header-two",
        depth: 0,
        inlineStyleRanges: [
          { offset: 0, length: "RESPONSIBILITIES".length, style: "BOLD" },
        ],
      },
      { key: "9", text: finalJobRequirements, type: "unstyled", depth: 0 },
      {
        key: "10",
        text: "QUALIFICATIONS",
        type: "header-two",
        depth: 0,
        inlineStyleRanges: [
          { offset: 0, length: "QUALIFICATIONS".length, style: "BOLD" },
        ],
      },
      {
        key: "11",
        text: finalQualifications,
        type: "unstyled",
        depth: 0,
      },
      {
        key: "12",
        text: "SKILLS",
        type: "header-two",
        depth: 0,
        inlineStyleRanges: [
          { offset: 0, length: "SKILLS".length, style: "BOLD" },
        ],
      },
      { key: "13", text: finalSkills, type: "unstyled", depth: 0 },
    ],
  };
}

module.exports = {
  createCoverLetterHtml,
  createDraftContentState,
};
