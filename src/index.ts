import { Elysia ,t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { cookie } from "@elysiajs/cookie"
import { Book, createBook, createUser, deleteBook, getBook, getBooks, getUser, updateBook, User } from "./model";

const app = new Elysia()

    app.use(
      jwt({
        name: 'jwt',
        secret: process.env.JWT_SECRET,
        algorithms: ['HS256'],
        // credentialsRequired: false,
      })
    ).use(cookie())

    app.get('/books', ()=> getBooks())

    app.get('/books/:id', async ({ jwt, cookie: { token }, params, set }: { jwt: any; cookie: any; params: any; set: any }) => {
      try {
        const bookid: number = parseInt(params.id);
        const profile = await jwt.verify(token.value);
        console.log('profile', profile);
        if (!token) {
          set.status = 401
          return { message: 'Unauthorized - No token provided' };
        }

        if (!profile) {
          set.status = 401
          return { message: 'Unauthorized - Invalid token' };
        }

        if (isNaN(bookid)) {
          set.status = 400
          return { message: 'Invalid book ID' };
        }
        const book = await getBook(bookid);
  
        return { book };
      } catch (error) {
        set.status = 500
        return { message: 'My Bad :( something went wrong', error };
      }
    });

    app.post('/books', ({ body, set }: { body: Book; set: any }) => {
      const response = createBook({
        title: body.title,
        author: body.author,
        description: body.description,
        price: body.price,
        release: body.release
      })
      if(response.status === 'error') {
        set.status = 400
        return {message: 'My Bad :('}
      }

      return {message: 'OK'}
    },{
      body: t.Object({
        title: t.String(),
        author: t.String(),
        description: t.String(),
        price: t.Number(),
        release: t.Number()
      })
    })

    app.put('/books/:id', ({ body, set, params }: { body: Book; set: any; params: { id: string } }) => {
      try {
        const bookid: number = parseInt(params.id)
        const response = updateBook(bookid,{
          title: body.title,
          author: body.author,
          description: body.description,
          price: body.price,
          release: body.release
        })
        if(response.status === 'error') {
          set.status = 400
          return {message: 'My Bad :('}
        }
  
        return {message: 'OK'}
      } catch (error) {
        set.status = 500
        return {message: 'My Bad :( somthing wrong'}
      }
    },{
      body: t.Object({
        title: t.String(),
        author: t.String(),
        description: t.String(),
        price: t.Number(),
        release: t.Number()
      })
    })

    app.delete('/books/:id',({params}) => {
      const bookid: number = parseInt(params.id)
      deleteBook(bookid)
      return {message: `Delete ID : ${bookid}`}
    })

    app.post('/register', async ({body,set}:{body:User; set:any})=>{
      try {
        let userData = body
        userData.password = await Bun.password.hash(userData.password,{
          algorithm: "bcrypt",
          cost: 4,
        })
        createUser(userData)
        return { message : 'Create User'}
      } catch (error) {
        set.status = 500
        return {message: 'My Bad :( somthing wrong',error}
      }

    },{
      body: t.Object({
        username: t.String(),
        password: t.String()
      })
    })

    app.post('/login', async ({ body, set, jwt, cookie: { token }, }: { body: { username: string, password: string }; set: any; jwt: any; cookie: any }) => {
      try {
        let userData = body
        const response = await getUser(userData)
        if(!response.loggedIn){
          set.status = 403
          return {message : 'login fail?'}
        }

        // const token = jwt.sign({ username: userData.username }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
        token.set({
          value: await jwt.sign({
            username: userData.username
          }),
          httpOnly: true,
          maxAge: 7 * 86400,
        })

        return{ message : ` login:` ,
          token: token.value
        }
      } catch (error) {
        set.status = 500
        return {message: 'My Bad :( somthing wrong',error}
      }
    },{
      body: t.Object({
        username: t.String(),
        password: t.String()
      })
    })

app.listen(3000)
console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
