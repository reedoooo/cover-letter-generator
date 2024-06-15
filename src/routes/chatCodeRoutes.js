const express = require('express');
const router = express.Router();
const {
  createComponent,
  makeRevision,
  forkRevision,
  getComponent,
  getComponentFromRevision,
  getMyComponents,
  importComponent,
} = require('../controllers/componentsController');
// const { checkAuth } = require("../middlewares/auth");

router.post('/createComponent', createComponent);
router.post('/makeRevision', makeRevision);
router.post('/forkRevision', forkRevision);
router.get('/getComponent/:id', getComponent);
router.get('/getComponentFromRevision/:revisionId', getComponentFromRevision);
router.get('/getMyComponents', getMyComponents);
router.post('/importComponent', importComponent);

module.exports = router;
