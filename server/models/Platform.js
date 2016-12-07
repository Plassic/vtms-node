'use strict';
let db = require('../config/sequelize.js'),
    Sequelize = require('sequelize');

let Platform = db.define('platform', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: Sequelize.STRING
    },
    instructions: {
        type: Sequelize.TEXT
    }
}, {
    freezeTableName: true,
    timestamps: false
});

module.exports = Platform;
