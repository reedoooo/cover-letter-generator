const { Builder, By, until } = require("selenium-webdriver");
const cheerio = require("cheerio");
const logger = require("../config/winston");

const scrapeLinkedInJobListing = async (url) => {
  let driver = await new Builder().forBrowser("chrome").build();
  try {
    // Navigate to the LinkedIn job listing page
    await driver.get(url);
    await driver.wait(
      until.elementLocated(By.css(".top-card-layout__title")),
      10000
    );

    // Get the page source
    const pageSource = await driver.getPageSource();
    const $ = cheerio.load(pageSource);

    // Utility function to clean text
    const cleanText = (text) =>
      text.replace(/\n/g, " ").replace(/\s\s+/g, " ").trim();

    // Extract job-related data
    const jobTitle = cleanText($(".top-card-layout__title").text());
    const companyName = cleanText(
      $(".topcard__org-name-link, .topcard__flavor--black-link").text()
    );
    const jobDescription = cleanText($(".description__text").text());
    const jobRequirements = cleanText(
      $(".description__job-criteria-text")
        .map((i, el) => $(el).text().trim())
        .get()
        .join(", ")
    );
    const skills = cleanText(
      $(".job-criteria__item")
        .filter(
          (i, el) =>
            $(el).find(".job-criteria__subheader").text().trim() === "Skills"
        )
        .find(".job-criteria__text")
        .text()
        .trim()
        .split(",")
        .map((skill) => skill.trim())
        .join(", ")
    );

    // Extract additional useful data
    const location = cleanText($(".topcard__flavor--bullet").first().text());
    const employmentType = cleanText(
      $(".job-criteria__item")
        .filter(
          (i, el) =>
            $(el).find(".job-criteria__subheader").text().trim() ===
            "Employment type"
        )
        .find(".job-criteria__text")
        .text()
        .trim()
    );
    const postedDate = cleanText($(".posted-time-ago__text").text());
    const seniorityLevel = cleanText(
      $(".job-criteria__item")
        .filter(
          (i, el) =>
            $(el).find(".job-criteria__subheader").text().trim() ===
            "Seniority level"
        )
        .find(".job-criteria__text")
        .text()
        .trim()
    );
    const industries = cleanText(
      $(".job-criteria__item")
        .filter(
          (i, el) =>
            $(el).find(".job-criteria__subheader").text().trim() ===
            "Industries"
        )
        .find(".job-criteria__text")
        .text()
        .trim()
    );

    // Extract company culture and benefits
    const companyCulture = cleanText($(".company-culture__text").text());
    const benefits = cleanText($(".benefits__text").text());

    // Construct result object
    const jobData = {
      jobTitle: jobTitle,
      companyName: companyName,
      jobDescription: jobDescription,
      jobRequirements: jobRequirements,
      skills: skills,
      location: location,
      employmentType: employmentType,
      postedDate: postedDate,
      seniorityLevel: seniorityLevel,
      industries: industries,
      companyCulture: companyCulture,
      benefits: benefits,
    };

    // Log extracted data
    logger.info("Extracted data from LinkedIn job listing:", jobData);

    return jobData;
  } catch (error) {
    logger.error(`Error scraping LinkedIn job listing: ${error.message}`, {
      url,
      error,
    });
    throw error;
  } finally {
    await driver.quit();
  }
};

module.exports = {
  scrapeLinkedInJobListing,
};
