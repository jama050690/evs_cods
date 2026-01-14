import express from "express"
import multer from "multer"
import path from "path"

const PORT = process.env.PORT
const app = express()

const storage = multer.diskStorage( {
	destination: "uploads/",
	filename: ( req, file, cb ) => {

		const ext = path.extname( file.originalname )
		const name = Date.now() + ext

		cb( null, name )
	}
} )

const upload = multer( { storage } )

app.use( express.static( "./uploads" ) )

app.set( "view engine", "ejs" )
app.set( "views", "./src/views" )

app.get( "/", ( req, res ) => {

	const success = req.query.success === "1"
	const photo = req.query.photo

	res.render( "home", { success, photo } )
} )

app.get( "/signup", ( req, res ) => res.render( "signup" ) )

app.post( "/signup", upload.single( "profile_picture" ), ( req, res ) => {

	res.redirect( `/?success=1&photo=${ req.file.filename }` )
} )

app.listen( PORT, () => console.log( PORT ) )
