import { password } from "bun";
import { Database } from "bun:sqlite";

const db = new Database("mydb.sqlite");

export interface Book {
    title: string;
    author: string;
    description: string;
    price: number;
    release: number;
  }

export interface User {
    username: string;
    password: string;
    // token: string;
}

const getBooks = () => {
    try {
        const query = db.query("SELECT * FROM books;");
        return query.all()
    } catch (error) {
        console.log("error",error)
        return {status : error}
    }
}

const getBook = (id: number) => {
    try {
        const query = db.query(`SELECT * FROM books where id=$id;`);
        return query.get({
            $id : id
        })

        return {status : 'OK'}
    } catch (error) {
        console.log("error",error)
        return {status : error}
    }
}

const createBook = (book: Book) => {

    try {
        if(!book.title || !book.author || !book.price){
            throw new Error('Validation Fail')
        }
        const query = db.query(`
            INSERT INTO books
            ("title","author","description","price","release")
            VALUES ($title,$author,$description,$price,$release);`)

            query.run({
                $title: book.title,
                $author: book.author,
                $description: book.description,
                $price: book.price,
                $release: book.release
            })

            return {status : 'OK'}

    } catch (error) {
        console.log("error",error)
        return {status : 'error',error}
    }
}

const updateBook = (id: number, book: Book) => {
    try {
        const query = db.query(`
            UPDATE books
            SET 
                title = $title,
                author = $author,
                description = $description,
                price = $price,
                release = $release
            WHERE id = $id;
        `);

        query.run({
            $id: id,
            $title: book.title,
            $author: book.author,
            $description: book.description,
            $price: book.price,
            $release: book.release
        });

        return {status : 'OK'}
    } catch (error) {
        console.log("error", error);
        return {status : error}
    }
};

const deleteBook = (id: number) => {
    try {
        const query = db.query(`
            DELETE FROM books
            WHERE id = $id;
        `);

        query.run({
            $id: id
        });

        return {status : 'OK'}
    } catch (error) {
        console.log("error", error);
        return {status : error}
    }
};

const createUser = (user: User) => {
    try {
        const query = db.query(`
            INSERT INTO users
            ("username","password")
            VALUES ($username,$password);`)

            query.run({
                $username: user.username,
                $password: user.password,
            })

            return {status : 'OK'}

    } catch (error) {
        console.log("error",error)
        return {status : error}
    }
}

const getUser = async (user: User) => {
    try {

        const query = db.query(`
            SELECT * FROM users 
            WHERE username = $username;
        `);

        const userData: any = query.get({
            $username: user.username,
            // $password: user.password
        });

        if(!userData){
            throw new Error('User not found')
        }
        
        const isMatch = await Bun.password.verify(user.password, userData.password)

        if (!isMatch) {
            throw new Error('User invalid')
            // return {message: true}; 
        } return {
            loggedIn : true
        }
        
    } catch (error) {
        console.log("error", error);
        return {status : error}
    }
};

export {
    getBooks,
    getBook,
    updateBook,
    deleteBook,
    getUser,
    createBook,
    createUser,
}

// console.log(getUser({
//     username: 'armguyz1',
//     password: 'asdsadasdasd'
// }))

// console.log(getBooks())