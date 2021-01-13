const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mailer = require('../../modules/mailer');

// Arquivo com o hash da aplicação
const authConfig = require('../../config/auth.json')

const User = require('../models/user');

const router = express.Router();

// Gera token com base nos parametros
function generateToken(params = {}) {
  return token = jwt.sign(params, authConfig.secret, {
    expiresIn: 86400
  });
}

// Rota de registro de novo usuário
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;

  try {
    if (await User.findOne({ email })) {
      return res.status(400).send({ field: 'email', error: 'User already exist' })
    }
    
    if (!name){
      return res.status(400).send({ field: 'name', error: 'Invalid name' })
    }

    if (!email){
      return res.status(400).send({ field: 'email', error: 'Invalid email' })
    }

    if (!password){
      return res.status(400).send({ field: 'password', error: 'Invalid password' })
    }

    const user = await User.create(req.body);

    user.password = undefined;

    return res.send({
      user,
      token: generateToken({ id: user.id })
    });
  } catch (err) {
    console.log(err);
    return res.status(400).send({ error: 'Registration failed' });
  }
})

// Rota de autenticação
router.post('/authenticate', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (!user){
    return res.status(400).send({field: 'email', error: 'User not found'})
  }

  if (!await bcrypt.compare(password, user.password)){
    return res.status(400).send({field: 'password', error: 'Invalid password'});
  }

  user.password = undefined;

  res.send({ 
    user, 
    token: generateToken({id: user.id})
  });
})

// Rota "esqueci minha senha"
router.post('/forgot_password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user){
      res.status(400).send({field: 'email', error: 'User not found'});
    }

    const token = crypto.randomBytes(20).toString('hex');

    const now = new Date();

    now.setHours(now.getHours() + 1);

    await User.findByIdAndUpdate(user.id, {
      $set: {
        passwordResetToken: token,
        passwordResetExpiresAt: now
      }
    });

    mailer.sendMail({
      to: email,
      subject: 'Reset Password',
      from: 'matheus-delima@outlook.com',
      template: 'auth/forgot_password',
      context: {
        token,
        name: user.name
      }
    }, (err) => {
      if (err) {
        console.log(err);
        res.status(400).send({ error: 'Cannot send forgot password email.'})
      }
      res.send()
    })
  } catch (err) {
    res.status(400).send({ error: 'Erro on forgot password, try again'});
  }
})

// Rota de reset de password
router.post('/reset_password', async (req, res) => {
  const { email, token, password } = req.body;

  try {
    const user = await User.findOne({ email })
    .select('+passwordResetToken passwordResetExpire');

    if (!user) {
      return res.status(400).send({ error: 'User not exist'});
    }

    if (token !== user.passwordResetToken) {
      return res.status(400).send({ error: 'Token not match'});
    }

    const now = new Date();

    if (now > user.passwordResetExpiresAt) {
      return res.status(400).send({ error: 'Expired token'});
    }

    user.password = password;
    
    await user.save();
    
    res.status(200).send({status: 'Success password reset'});
  } catch (err) {
    res.status(400).send({ error: 'Cannot reset password, try again'});
  }
});

module.exports = (app) => app.use('/auth', router);
