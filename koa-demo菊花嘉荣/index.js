var Koa = require('koa');
var hbs = require('koa-hbs');
var router = require('koa-router');
var route = new router();
var app = new Koa();

app.use(hbs.middleware({
	viewPath: __dirname + '/views'
}))


route.get('/',async (ctx) => {
	var qqq = ["html","css","javascript"]
	await ctx.render('index', {title: qqq});
})

route.get('/user/:id',async function(ctx){
	var user =  {
		name: ctx.params.id,
		sex: 'male',
		age: 19
	}
	await ctx.render('index',{ user } );
})



app.use(route.routes());
app.use(route.allowedMethods());

app.listen(3000);