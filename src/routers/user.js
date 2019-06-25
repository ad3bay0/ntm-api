const express = require('express');
const router = new express.Router();
const User = require('../models/user');
const auth = require('../middleware/auth');
const multer = require('multer');
const sharp = require('sharp');


//create new user
router.post('/users', async (req, res) => {

    const user = new User(req.body);

    try {

        await user.save();
        const token = await user.generateToken()
        res.status(201).send({ user, token });

    } catch (error) {

        res.status(400).send(error);
    }

});


router.post('/users/login', async (req, res) => {

    const requestBody = req.body;

    try {

        const user = await User.checkCredentials(requestBody.email, requestBody.password);

        const token = await user.generateToken();

        res.status(200).send({ user, token });

    } catch (error) {

        res.status(400).send(error);
    }

});

router.post('/users/logout', auth, async (req, res) => {

    try {

        req.user.token = req.user.token.filter((t) => t.token !== req.token);

        await req.user.save();

        res.status(200).send();

    } catch (error) {

        res.status(500).send();
    }

});

router.post('/users/logout-all', auth, async (req, res) => {

    try {

        req.user.token = [];

        await req.user.save();

        res.status(200).send();

    } catch (error) {

        res.status(500).send();
    }

});

router.get('/users/profile', auth, async (req, res) => {

    res.status(200).send(req.user);

});


router.patch('/users/me', auth, async (req, res) => {

    const _id = req.params.id;
    const field = req.body;

    const updates = Object.keys(field);
    const allowedParams = ['name', 'email', 'age', 'password'];
    const isValidOperation = updates.every((update) => allowedParams.includes(update));

    if (!isValidOperation) {


        return res.status(400).send({ error: 'invalid parameters' });
    }

    try {

        updates.forEach(update => req.user[update] = req.body[update]);

        await req.user.save();

        res.status(200).send(req.user);

    } catch (error) {

        res.status(400).send(error);
    }


})

router.delete('/users/me', auth, async (req, res) => {

    try {

        await req.user.remove();

        res.status(200).send();

    } catch (error) {

        res.status(500).send({ error: 'server error!' });
    }

});

const upload = multer(
    {
    
        limits: { fileSize: 1000000 },
        fileFilter(req, file, cb) {

            if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
                return cb(new Error('please upload an image file'));
            }

            cb(undefined, true);
        }
    });

router.post('/users/me/avatar',auth,upload.single('avatar'), async (req, res) => {

    const buffer = await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer();

    req.user.avatar = buffer;

    await req.user.save();

    res.send();

},(error,req,res,next)=>{

    res.status(400).send({error:error.message});

});

router.delete('/users/me/avatar',auth, async (req, res) => {

    req.user.avatar = undefined;

    await req.user.save();

    res.send();
 
});

router.get('/users/:id/avatar', async (req, res) => {

   try {
       const user = await User.findById(req.params.id);

       if(!user||!user.avatar){

        throw new Error();
       }

       res.set('Content-Type','image/png');
       res.send(user.avatar);
       
   } catch (error) {
       
    res.status(400).send();
   }
 
});

module.exports = router;