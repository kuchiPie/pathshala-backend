const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const mysql = require('mysql')

const app = express()
app.use(cors())
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))

const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'password',
    database: 'study_room'
});

app.post('/teachers/details', (req, res) => {

    const name = req.body.name
    const email = req.body.email
    const organisation = req.body.organisation
    const main_subject = req.body.main_subjects
    const sub_subject = req.body.sub_subject
    const contact = req.body.contact

    const sqlQuery = "INSERT INTO teacher_details (name, email, organisation, main_subject, sub_subject, contact) VALUES (?,?,?,?,?,?)"

    db.query(sqlQuery, [name, email, organisation, main_subject, sub_subject, contact], (err, result) => {
        console.log(err)
        res.send({
            contact: contact
        })
    })

})

app.post('/teachers/give_assignment', (req, res) => {

    const teacher_id = req.body.teacher_id
    const title = req.body.title
    const instruction = req.body.instruction
    const grade = req.body.grade
    const points = req.body.points
    const topic = req.body.topic
    const due_date = req.body.due_date

    const sqlQuery = "INSERT INTO give_assignment (teacher_id, title, instruction, grade, points,topic, due_date) VALUES (?,?,?,?,?,?, ?)"

    db.query(sqlQuery, [teacher_id, title, instruction, grade, points, topic, due_date], (err, result) => {
        console.log(err)
        res.send(result)
    })

    // res.send(details)

})

app.get('/teacher/get_assignment_by_id', (req, res) => {
    const teacher_id = req.body.teacher_id

    const sqlQuery = "SELECT * FROM give_assignment WHERE teacher_id = ?"

    db.query(sqlQuery, [teacher_id], (err, result) => {
        res.send(result)
    })

})

app.post('/user/send_otp', (req, res) => {

    const contact = req.body.contact
    const role = req.body.role
    const otp = Math.floor((Math.random() * 100000) + 1)

    const sqlQuery = "INSERT INTO user_otp (contact, role, otp) VALUES (?,?,?)"

    db.query(sqlQuery, [contact, role, otp], (err, result) => {
        console.log(err)
        res.send(result)
    })

    // res.send(role, contact, otp)

})


app.post('/user/resend_otp', (req, res) => {

    const contact = req.body.contact
    const role = req.body.role
    const otp = Math.floor((Math.random() * 100000) + 1)

    const sqlQuery = "UPDATE user_otp SET otp = ? WHERE contact = ?"

    db.query(sqlQuery, [otp, contact], (err, result) => {
        console.log(err)
        res.send(result)
    })
    // res.send(role, contact, otp)
})

app.post('/user/verify', (req, res) => {
    const otp = req.body.otp
    const user_id = req.body.user_id
    const sqlQuery = "SELECT otp FROM user_otp WHERE otp = ? and user_id = ?"

    db.query(sqlQuery, [otp, user_id], (err, result) => {
        if (result.length !== 0) {
            res.send({
                status: true,
                message: "user verified"
            })
        }
        else {
            res.send({
                status: false,
                message: "wrong otp"
            })
        }
    })
})

app.listen(8080, () => {
    console.log('server is up on port 8080')
})