const fs = require("fs");
const path = require("path");
const { default: slugify } = require("slugify");
const { v4 } = require("uuid");
const UrlPattern = require("url-pattern");
const { writeToServerDocuments } = require("../../files");
const { tokenizeString } = require("../../tokenizer");
const {
  ConfluencePagesLoader,
} = require("langchain/document_loaders/web/confluence");

function urlMatchesPatter(url, patter) {
  const urlPattern = new UrlPattern(patter);
  return urlPattern.match(url);
}

function generateCustomDomain({ subdomain, domain, tld }) {
  return (subdomain ? `${subdomain}.` : "") + `${domain}.${tld}`;
}

function validSpaceUrl(spaceUrl = "") {
  // Atlassian default URL match
  const atlassianMatch = urlMatchesPatter(spaceUrl, "https\\://(:subdomain).atlassian.net/wiki/spaces/(:spaceKey)*");
  if (atlassianMatch) {
    return { valid: true, result: atlassianMatch };
  }

  // Custom URL match
  const customMatch = urlMatchesPatter(spaceUrl, "https\\://(:subdomain.):domain.:tld/wiki/spaces/(:spaceKey)*");
  if (customMatch) {
    customMatch.customDomain = generateCustomDomain(customMatch);
    return { valid: true, result: customMatch, humanReadable: false };
  }

  // Human Readable URL match
  const humanReadableMatch = urlMatchesPatter(spaceUrl, "https\\://(:subdomain.):domain.:tld/display/(:spaceKey)*");
  if (humanReadableMatch) {
    humanReadableMatch.customDomain = generateCustomDomain(humanReadableMatch);
    return { valid: true, result: humanReadableMatch, humanReadable: true };
  }

  // No match
  return { valid: false, result: null };
}

async function loadConfluence({ pageUrl, username, accessToken }) {
  if (!pageUrl || !username || !accessToken) {
    return {
      success: false,
      reason:
        "You need either a username and access token, or a personal access token (PAT), to use the Confluence connector.",
    };
  }

  const validSpace = validSpaceUrl(pageUrl);
  const { result: validSpaceResult, humanReadable } = validSpace;
  if (!validSpaceResult) {
    return {
      success: false,
      reason:
        "Confluence space URL is not in the expected format of one of https://domain.atlassian.net/wiki/space/~SPACEID/* or https://customDomain/wiki/space/~SPACEID/* or https://customDomain/display/~SPACEID/*",
    };
  }

  const { subdomain, customDomain, spaceKey } = validSpaceResult;
  let subpath = humanReadable ? `` : `/wiki`;
  let baseUrl = `https://${subdomain}.atlassian.net${subpath}`;
  if (customDomain) {
    baseUrl = `https://${customDomain}${subpath}`;
  }

  console.log(`-- Working Confluence ${baseUrl} --`);
  const loader = new ConfluencePagesLoader({
    baseUrl,
    spaceKey,
    username,
    accessToken,
  });

  const { docs, error } = await loader
    .load()
    .then((docs) => {
      return { docs, error: null };
    })
    .catch((e) => {
      return {
        docs: [],
        error: e.message?.split("Error:")?.[1] || e.message,
      };
    });

  if (!docs.length || !!error) {
    return {
      success: false,
      reason: error ?? "No pages found for that Confluence space.",
    };
  }
  const outFolder = slugify(
    `${subdomain}-confluence-${v4().slice(0, 4)}`
  ).toLowerCase();

  const outFolderPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(
          __dirname,
          `../../../../server/storage/documents/${outFolder}`
        )
      : path.resolve(process.env.STORAGE_DIR, `documents/${outFolder}`);

  if (!fs.existsSync(outFolderPath))
    fs.mkdirSync(outFolderPath, { recursive: true });

  docs.forEach((doc) => {
    if (!doc.pageContent) return;

    const data = {
      id: v4(),
      url: doc.metadata.url + ".page",
      title: doc.metadata.title || doc.metadata.source,
      docAuthor: subdomain,
      description: doc.metadata.title,
      docSource: `${subdomain} Confluence`,
      chunkSource: `confluence://${doc.metadata.url}`,
      published: new Date().toLocaleString(),
      wordCount: doc.pageContent.split(" ").length,
      pageContent: doc.pageContent,
      token_count_estimate: tokenizeString(doc.pageContent).length,
    };

    console.log(
      `[Confluence Loader]: Saving ${doc.metadata.title} to ${outFolder}`
    );
    writeToServerDocuments(
      data,
      `${slugify(doc.metadata.title)}-${data.id}`,
      outFolderPath
    );
  });

  return {
    success: true,
    reason: null,
    data: {
      spaceKey,
      destination: outFolder,
    },
  };
}

module.exports = loadConfluence;
