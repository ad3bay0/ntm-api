const express = require('express');
const router = new express.Router();
const Task = require('../models/task');
const auth = require('../middleware/auth');


router.get('/tasks',auth, async (req, res) => {

   const match = {};
   const sort = {};

   if(req.query.sortBy){

    const part = req.query.sortBy.split(':');

    sort[part[0]] = part[1] === 'desc' ? -1:1

   }


   if(req.query.completed){
       match.completed = req.query.completed === 'true';
   }

    try {

     await req.user.populate({

        path:'tasks',
        match,
        options:{
            limit:parseInt(req.query.limit),
            skip:parseInt(req.query.skip),
            sort
        }

      }).execPopulate();
        
        res.status(200).send(req.user.tasks);

    } catch (error) {
        res.status(500).send();
    }

});


router.get('/tasks/:id',auth, async (req, res) => {

    const _id = req.params.id;

    try {

        const task = await Task.findOne({_id,owner:req.user._id});

        if (!task) {

            return res.status(404).send();
        }

        res.status(200).send(task);

    } catch (error) {

        res.status(500).send();
    }

});



router.post('/tasks',auth, async (req, res) => {

    const task = new Task({...req.body,owner:req.user._id});

    try {
        await task.save();
        res.status(201).send(task);

    } catch (error) {
        res.status(400).send();
    }
});


router.patch('/tasks/:id',auth,async (req,res)=>{

    const _id = req.params.id;
    const params = req.body;
    const fieldsFromClient = Object.keys(req.body);
    const fieldsRequired = ['completed','description'];

    const isValidParams = fieldsFromClient.every((field)=>fieldsRequired.includes(field));

    if(!isValidParams){

        return res.status(400).send({error:'invalid parameter passed!'});
    }

    try {
        
        const task = await Task.findOne({_id,owner:req.user._id});

        if(!task){

            return res.status(404).send({error:"task with this id not found!"});
         }

        fieldsFromClient.forEach((param)=>task[param]=params[param]);

        await task.save();

       

        res.status(200).send(task);

    } catch (error) {
        
        res.status(500).send(error);
    }


});


router.delete('/tasks/:id',auth,async (req,res)=>{

    const _id = req.params.id;

    try {
        
        const task = await Task.findOneAndDelete({_id,owner:req.user._id});

        if(!task){

            res.status(404).send({error:'no task found to delete'});
        }

        res.status(200).send({message:'task deleted!'});

    } catch (error) {

        res.status(500).send();
    }

});

module.exports = router;

