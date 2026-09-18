const express=require('express');
const path=require('path');
const app=express();
const PORT=process.env.PORT||8080;
app.use(express.json());
app.use(express.static(path.join(__dirname,'..','public')));
const products=[
{id:1,name:'Laptop Pro 14"',price:1299.99,category:'Informatique',emoji:'💻',description:'Ordinateur portable performant pour le travail, les études et le développement.'},
{id:2,name:'Casque Audio Pro',price:89.90,category:'Audio',emoji:'🎧',description:'Casque confortable avec réduction de bruit pour une écoute immersive.'},
{id:3,name:'Clavier Mécanique',price:119,category:'Informatique',emoji:'⌨️',description:'Clavier mécanique compact avec touches rétroéclairées.'},
{id:4,name:'Souris Ergonomique',price:49.90,category:'Informatique',emoji:'🖱️',description:'Souris précise et confortable pour une utilisation quotidienne.'},
{id:5,name:'Montre Connectée',price:159,category:'Lifestyle',emoji:'⌚',description:'Suivez vos activités et notifications depuis votre poignet.'},
{id:6,name:'Enceinte Bluetooth',price:69.90,category:'Audio',emoji:'🔊',description:'Enceinte portable avec son puissant et bonne autonomie.'}];
const users=[{id:1,firstName:'Demo',lastName:'Student',email:'student@shopnow.test',password:'Password123!'}];
app.get('/api/health',(req,res)=>res.json({status:'ok'}));
app.get('/api/products',(req,res)=>res.json(products));
app.get('/api/products/:id',(req,res)=>{const p=products.find(x=>x.id===Number(req.params.id));if(!p)return res.status(404).json({error:'Produit introuvable'});res.json(p)});
app.post('/api/register',(req,res)=>{const {firstName,lastName,email,password}=req.body;if(!firstName||!lastName||!email||!password)return res.status(400).json({error:'Tous les champs sont obligatoires'});if(password.length<8)return res.status(400).json({error:'Le mot de passe doit contenir au moins 8 caractères'});if(users.some(u=>u.email.toLowerCase()===email.toLowerCase()))return res.status(409).json({error:'Un compte existe déjà avec cet email'});const u={id:users.length+1,firstName,lastName,email,password};users.push(u);res.status(201).json({message:'Compte créé avec succès',user:{id:u.id,firstName,lastName,email}})});
app.post('/api/login',(req,res)=>{const {email,password}=req.body;const u=users.find(x=>x.email.toLowerCase()===String(email||'').toLowerCase()&&x.password===password);if(!u)return res.status(401).json({error:'Email ou mot de passe incorrect'});res.json({message:'Connexion réussie',user:{id:u.id,firstName:u.firstName,lastName:u.lastName,email:u.email}})});
app.get('*',(req,res,next)=>{if(req.path.startsWith('/api/'))return next();res.sendFile(path.join(__dirname,'..','public','index.html'))});
if(require.main===module)app.listen(PORT,()=>console.log(`ShopNow running on http://localhost:${PORT}`));
module.exports=app;
