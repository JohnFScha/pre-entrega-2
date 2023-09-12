import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import { engine } from 'express-handlebars';
import { __dirname } from './path.js';
import path from 'path';
import productRouter from './routes/products.routes.js';
import cartsRouter from './routes/carts.routes.js';
import messageRouter from './routes/messages.routes.js';
import productModel from './models/products.models.js';
import cartsModel from './models/carts.models.js';
import messageModel from './models/message.models.js';

const app = express();
const PORT = 4000;
const httpServer = app.listen(PORT, () => {
	console.log(`Server listening on port: ${PORT}`)
});

// Conexion con MongoDB
mongoose.connect(process.env.MONGO_DB)
	.then(async () => console.log('Connection to DB'))
	.catch(error => console.log('Error connecting to DB', error))

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.resolve(__dirname, './views'));


// Socket
const io = new Server(httpServer);

io.on('connection', async (socket) => {
	console.log('Conexión con Socket.io');

	const products = await productModel.find();
	socket.emit('products', products);

	socket.on('add-to-cart', async (productData) => {
		let cart = await cartsModel.findOne({ _id: "64f8fbb6d998a951bcb2774e" })
		if (!cart) {
			cart = await cartsModel.create({ products: [] })
		}
		const existingProd = cart.products.find(prod => productData._id.toString() === prod.id_prod._id.toString());
		console.log(existingProd)

		if (existingProd) {
			existingProd.quantity += 1
		} else {
			cart.products.push({
				id_prod: productData._id,
				quantity: 1
			})
		}

		await cart.save()
		console.log('Product added to cart:', productData)
	});

	socket.on('mensaje', async info => {
		const { email, message } = info;
		await messageModel.create({
			email,
			message,
		});
		const messages = await messageModel.find();

		socket.emit('mensajes', messages);
	});
});

// Serve static files from the "public" folder
app.use('/static', express.static(path.join(__dirname, '/public')));

// Vista de productos
app.get('/static/products', async (req, res) => {
	const products = await productModel.find()

	const cleanData = {
		products: products.map(product => ({
			title: product.title,
			description: product.description,
			category: product.category,
			price: product.price,
			stock: product.stock,
			_id: product._id
		}))
	};

	res.render('products', {
		products: cleanData.products,
		pathCSS: 'products',
		pathJS: 'products'
	});
});

// Vista de chat
app.get('/static/messages', async (req, res) => {
	const messages = await messageModel.find();

	const cleanData = {
		messages: messages.map(message => ({
			email: message.email,
			message: message.message
		}))
	}

	res.render('messages', {
		messages: cleanData.messages,
		pathCSS: 'chat',
		pathJS: 'chat',
	});
});

// Routes
app.use('/api/products', productRouter);
app.use('/api/carts', cartsRouter)
app.use('/api/messages', messageRouter)