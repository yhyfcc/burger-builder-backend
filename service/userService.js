const {db} = require('../db');

const orderSchema = new db.Schema({
    orderData: Object,
    ingredients: Object,
    price: Number,
    userId: String
},{ timestamps: true })

const userSchema = new db.Schema({
    password: String,
    email: String,
    orders: [orderSchema]
},{ timestamps: true })



const User = db.model('user',userSchema);

async function register(email,password){
    let existingUser = await User.find({email});
    if(existingUser.length > 0){
        return Promise.reject('Email already exists');
    }
    let newUser = new User({password,email});
    await newUser.save();
    return Promise.resolve({
        localId: newUser.get('_id')
    });
}

async function login(email,password){
    let user = await User.findOne({email});
    if(!user){
        return Promise.reject('User does not exist');
    }
    if(user.password !== password){
        return Promise.reject('Password not correct');
    }else {
        return Promise.resolve({
            localId: user.get("_id")
        })
    }
}

async function addOrder(userId,orderData){
    let user = await User.findOne({_id:userId});
    if(!user) {
        return Promise.reject('User does not exist');
    }
    user.orders.push(orderData);
    user = await user.save();

    return Promise.resolve({
        name: user.orders[user.orders.length - 1].get('_id')
    });
}

async function getOrders(userId){
    let user = await User.findOne({_id:userId});
    if(!user) {
        return Promise.reject('User does not exist');
    }
    let orders = user.get('orders');
    let res = {};
    orders.forEach(curr => res[curr._id] = curr);
    return Promise.resolve(res);
}


module.exports = {
    register,
    login,
    addOrder,
    getOrders
}