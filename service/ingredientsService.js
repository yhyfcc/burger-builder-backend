const {db} = require('../db');

const ingredientsSchema = new db.Schema({
    bacon: Number,
    cheese: Number,
    salad: Number,
    meat: Number
})

const ingredients = new db.model('ingredients',ingredientsSchema);

async function getIngredients(){
    let priceList = await ingredients.findOne();
    priceList = priceList.toJSON();
    delete priceList._id;
    return Promise.resolve(priceList);
}

module.exports = {
    getIngredients
}