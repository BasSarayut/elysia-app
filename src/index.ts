import { Elysia } from "elysia";
import { Book, createBook, getBook, getBooks, updateBook } from "./model";

const app = new Elysia()

app
    .get('/books', ()=> getBooks())
    .get('/books/:id', ({params})=> {
      return getBook(parseInt(params.id))
    })

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
    })


app.listen(3000)
console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
