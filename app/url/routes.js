const Joi = require('joi');
const router = require('express').Router();
const url = require('./url');


router.get('/:hash', async (req, res, next) => {
  const source = await url.getUrl(req.params.hash);

  // TODO: Respond accordingly when the hash wasn't found (404 maybe?)
  if (!source) {
    const errorHandle = new Error('Short Link not found');
    errorHandle.status = 404
    next(errorHandle);
    return false;
  }

  // TODO: Hide fields that shouldn't be public

  // TODO: Register visit
  const { _id } = source;
  try {
    url.registerVisit(_id);
  } catch (e) {
    e.message = "Something went wrong with registering visit";
    next({ message: e.message });
  }
  // Behave based on the requested format using the 'Accept' header.
  // If header is not provided or is */* redirect instead.
  const accepts = req.get('Accept');

  switch (accepts) {
    case 'text/plain':
      res.end(source.url);
      break;
    case 'application/json':
      res.json(source);
      break;
    default:
      res.redirect(source.url);
      break;
  }
});


router.post('/', async (req, res, next) => {
  const { url: urlBody } = req.body;
  //validate Object type
  const addURLSchema = {
    url: Joi.string().required(),
    protocol: Joi.string().required(),
    domain: Joi.string().hostname(),
    path: Joi.string(),
    isCustom: Joi.boolean().required(),
    active: Joi.boolean().required()
  }
  const joiBodyValidate = Joi.validate(req.body, addURLSchema);

  if (joiBodyValidate.error) {
    next(new Error(joiBodyValidate.error));
    return false;
  }

  //validate if URL is duplicated
  const validateUrlDupUrl = await url.getUrl(urlBody);
  if (!!validateUrlDupUrl) return next(new Error("The URL is duplicated, please submit a different URL"));

  // TODO: Validate 'req.body.url' presence

  try {
    let shortUrl = await url.shorten(urlBody, url.generateHash(urlBody));
    res.json(shortUrl);
  } catch (e) {
    // TODO: Personalized Error Messages
    e.message = "Something went wrong with URL";
    next({ message: e.message });
  }
});


router.delete('/:hash/remove/:removeToken', async (req, res, next) => {
  // TODO: Remove shortened URL if the remove token and the hash match
  const promiseRes = {}
  const { hash, removeToken } = req.params;
  try {
    const { deletedCount } = await url.deleteURL(removeToken, hash);
    //promiseRes.status = "OK";
    promiseRes.message = (deletedCount > 0) ? "Object(s) removed: " + deletedCount : "Object not found or already deleted";
  } catch (e) {
    promiseRes.message = e;
  }
  next(promiseRes);
});

module.exports = router;
