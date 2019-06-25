const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth  = async (req,res,next)=>{

try {
    
    const token = req.header('Authorization').replace('Bearer ','');
    
    const decode = jwt.verify(token,process.env.JWT_TOKEN);

    
    const user = await User.findOne({_id:decode._id,'token.token':token});
    
    if(!user){

          throw new Error();
    }

    req.token = token;
    req.user = user;

    next();
    
} catch (error) {
    
    res.status(401).send({error:'User are not authroized'});
}

};

module.exports = auth;