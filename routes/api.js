const express = require('express');
const router = express.Router();
const { Vault } = require('ansible-vault');

router.get('/', (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.status(400).json({
    status: 'fail',
    msg: 'GET request not supported. Please use POST with the required parameters.'
  });
});

router.post('/', (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  const { passphrase, content, action } = req.body;

  if (!passphrase || !content || !action) {
    return res.status(400).json({
      status: 'fail',
      msg: 'Missing parameters. Please specify passphrase, content, and action (encrypt or decrypt).'
    });
  }

  const vault = new Vault({ password: passphrase });
  if (action === 'encrypt') {
    vault.encrypt(content)
      .then(encryptedData => res.status(200).json({
        result: encryptedData,
        status: 'success',
        msg: 'Your data was successfully encrypted!'
      }))
      .catch(error => res.status(500).json({
        status: 'fail',
        msg: `Error during encryption: ${error.message}`
      }));
  } else if (action === 'decrypt') {
    vault.decrypt(content)
      .then(decryptedData => res.status(200).json({
        result: decryptedData,
        status: 'success',
        msg: 'Your data was successfully decrypted!'
      }))
      .catch(error => res.status(500).json({
        status: 'fail',
        msg: `Error during decryption: ${error.message}`
      }));
  } else {
    res.status(400).json({
      status: 'fail',
      msg: 'Invalid action. Please specify "encrypt" or "decrypt" as the action.'
    });
  }
});

module.exports = router;