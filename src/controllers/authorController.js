// const bcrypt = require('bcryptjs')
const bcrypt = require('bcrypt')
const authorModel = require('../models/authorModel')
const jwt = require('jsonwebtoken')
const { isValid,
    validString,
    validateEmail, isValidPassword, isValidReqBody } = require('../utils/index.js')
// const isValidReqBody = (value) => {
//     return Object.keys(value).length > 0
// }

require('dotenv').config();

const { JWT_SECRET, JWT_EXPIRY } = process.env


// const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

const createAuthor = async function (req, res) {
    try {
        let author = req.body
        const { title, fname, lname, email, password } = author;
        if (Object.keys(author).length == 0) { res.status(400).send({ status: false, message: "Enter the Author details" }) }

        //checking for required fields
        if (!title) { return res.status(400).send({ status: false, message: "title is required" }) }

        if (!fname) { return res.status(400).send({ status: false, message: "author first name is required" }) }

        if (!lname) { return res.status(400).send({ status: false, message: "author last name is required" }) }

        if (!email) { return res.status(400).send({ status: false, message: "email is required" }) }

        if (!password) { return res.status(400).send({ status: false, message: "password is required" }) }

        // validatiing the required feilds
        if (!isValid(title)) { return res.status(400).send({ status: false, message: "title is invalid" }) }
        if (!["Mr", "Mrs", "Miss"].includes(title)) return res.status(400).send({ status: false, message: "title should be Mr,Miss,Mrs" })

        //   if (!isValid(fname)) { return res.status(400).send({ status: false, message: "author first name is not valid " }) }
        //   if (!validString(fname)) { return res.status(400).send({ status: false, message: "author first name is not valid string" }) }

        //   if (!isValid(lname)) { return res.status(400).send({ status: false, message: "author last name is not valid " }) }
        //   if (!validString(lname)) { return res.status(400).send({ status: false, message: "author last name is not valid string" }) }

        if (password.length < 7) return res.status(400).send({ status: false, message: "Password length should be greater than 8 characters" })
        // if (!isValid(password)) { return res.status(400).send({ status: false, message: "password name is not valid" }) }
        //   if (!isValidPassword(password)) { return res.status(400).send({ status: false, message: "invalid password " }) }

        if (!isValid(email)) { return res.status(400).send({ status: false, message: " Invalid email" }) }

        if (!validateEmail(email)) { return res.status(400).send({ status: false, message: "Enter the valid email" }) }

        //checking for unique mail
        const uniqueMail = await authorModel.findOne({ email: email });
        if (uniqueMail) return res.status(400).send({ status: false, message: "this email already exist" });

        // Hashing the password using bcrypt
        
        let authorCreated = await authorModel.create(author)
        return res.status(201).send({ status: true, data: authorCreated })
    }
    catch (err) { return res.status(500).send({ status: false, message: err.message }) }

}




const getAuthor = async function (req, res) {
    try {
        const authors = await authorModel.find()
        res.status(200).send({ status: true, data: authors });
    }
    catch (error) {
        console.log(error)
        res.status(500).send({ status: false, error: 'Internal Server Error' });
    }
};


const login = async (req, res) => {
    try {
        if (!isValidReqBody(req.body)) {
            res.status(400).json({
                status: false,
                message: 'Invalid Request Parameters, Please provide login details'
            });
            return
        }

        const {
            email,
            password
        } = req.body

        if (!validateEmail(email)) {
            res.status(400).json({
                status: false,
                message: "Email is required"
            })
        }

        if (!(/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email))) {
            res.status(400).json({
                status: false,
                message: "Email should be valid email."
            })
        }

        // if (!isValidPassword(password)) {
        //     res.status(400).json({
        //         status: false,
        //         message: "Please enter valid password, It should contain 1 uppercase, 1 special symbol and should be 8 digit long."
        //     })
        // }



        if (!email || !password) return res.status(400).json({
            message: "Please enter email and password"
        })

        const author = await authorModel.findOne({
            email: email,
            password : password
        })


        if (!author) return res.status(401).json({
            status: false,
            message: 'You are not registered'
        })
        console.log(author.password)

        //const isValidAuthor = bcrypt.compareSync(password, author.password)

        if (password) {
            const token = jwt.sign({
                author_id: author._id,
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) * 10 * 60 * 60
            }, JWT_SECRET)

            res.header('x-api-key', token)

            res.status(200).json({
                status: true,
                data: {
                    token
                }
            })
        } else {
            return res.status(401).send({
                status: false,
                message: "not a authenticate user"
            })
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: false,
            message: error.message
        })
    }
}


module.exports.login = login
module.exports.createAuthor = createAuthor;
module.exports.getAuthor = getAuthor;