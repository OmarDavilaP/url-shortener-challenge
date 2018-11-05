const Joi = require('joi');
const { domain } = require('../../environment');
const SERVER = `${domain.protocol}://${domain.host}`;

const UrlModel = require('./schema');
const parseUrl = require('url').parse;
const validUrl = require('valid-url');
/**
 * Lookup for existant, active shortened URLs by url.
 * Using this approach to verify if URL is duplicated or not, so param was renamed to linkIdString 
 * Query will search in hash for redirect or in url for find duplicate
 * 'null' will be returned when no matches were found.
 * @param {string} linkIdString //
 * @returns {object}
 */
async function getUrl(linkIdString) {
  let source = await UrlModel.findOne({ active: true, $or: [{ hash: linkIdString }, { url: linkIdString }] });
  return source;
}

/**
 * Generate an unique hash-ish- for an URL.
 * TODO: Deprecated the use of UUIDs.
 * TODO: Implement a shortening algorithm
 * @param {string} url
 * @returns {string} hash
 */
function generateHash(url) {
  const Alpha = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_';
  const convertUrltoB64 = Buffer.from(url).toString('base64');
  let hash = '';
  for (let i = 0; i < convertUrltoB64.length; i++) {
    hash += Alpha.charAt(Math.floor(Math.random() * Alpha.length))
  }
  return hash.slice(0, 6);

}


/**
 * Create an instance of a shortened URL in the DB.
 * Parse the URL destructuring into base components (Protocol, Host, Path).
 * An Error will be thrown if the URL is not valid or saving fails.
 * @param {string} url
 * @param {string} hash
 * @returns {object}
 */
async function shorten(url, hash) {

  if (!isValid(url)) {
    throw new Error('Invalid URL');
  }

  // Get URL components for metrics sake
  const urlComponents = parseUrl(url);
  const protocol = urlComponents.protocol || '';
  const domain = `${urlComponents.host || ''}${urlComponents.auth || ''}`;
  const path = `${urlComponents.path || ''}${urlComponents.hash || ''}`;

  // Generate a token that will alow an URL to be removed (logical)
  const removeToken = this.generateHash(url);

  // Create a new model instance
  const shortUrl = new UrlModel({
    url,
    protocol,
    domain,
    path,
    hash,
    isCustom: false,
    removeToken,
    active: true
  });

  try {
    const saved = await shortUrl.save();
  } catch (e) {
    next(e)
  }

  // TODO: Handle save errors

  return {
    url,
    shorten: `${SERVER}/${hash}`,
    hash,
    removeUrl: `${SERVER}/${hash}/remove/${removeToken}`
  };

}

/**
 * TODO: removeUrl
 * @param {string} removeToken
 * @param {string} hash
 * @returns {object} 
 */

async function deleteURL(removeToken, hash) {
  try {
    return await UrlModel.deleteOne({ removeToken, hash });
  } catch (e) {
    next(e);
  }

}

/**
* TODO: regist visit
* @param { string } id
* @returns { object } 
*/
async function registerVisit(id) {
  try {
    return await UrlModel.findOneAndUpdate({ _id: id }, { $inc: { visit: 1 } });
  } catch (e) {
    next(e)
  }

}


/**
 * Validate URI
 * @param {any} url
 * @returns {boolean}
 */
function isValid(url) {
  return validUrl.isUri(url);
}

module.exports = {
  shorten,
  getUrl,
  generateHash,
  isValid,
  deleteURL,
  registerVisit
}
