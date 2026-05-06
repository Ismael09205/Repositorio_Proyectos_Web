const express=require("express")
const cors=require("cors");
const app=express();
app.use(cors());
app.use(express.json());

app.get("/",(req,res)=>{
    res.send("API Funcionando");
});


let productos=[{"id":1,"nombre":"Leche","categoria":"Alimentos","precio":10,"stock":20},
                {"id":2,"nombre":"Licuadora","categoria":"Cocina","precio":150,"stock":10}
]
app.get("/api/productos",(req,res)=>{
    res.json(productos);
});
app.get("/api/productos/:id",(req,res)=>{
    const id=Number(req.params.id);
    const producto =productos.find(p=>p.id===id);

    if(!producto){
        return res.status(404).json({mensaje:"Producto no encontrado"})
    }
    res.json(producto)
})
app.post("/api/productos",(req,res)=>{
    const {nombre,categoria,precio,stock}=req.body;
if(!nombre||!precio){
    return res.status(400).json({mensaje:"Campos incompletos"})

}
const nuevoProducto={id:productos.length+1,nombre,categoria,precio,stock}
productos.push(nuevoProducto);
res.status(201).json(nuevoProducto);

});
app.listen(3000, ()=>{
console.log("Servidor en http://localhost:3000");
});