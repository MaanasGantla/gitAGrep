import React, { useState, useEffect } from 'react';
import { TextField, InputAdornment, IconButton, Grid, Typography, MenuItem } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Snackbar } from '@mui/material';
import '../index.css'; // Assuming the CSS file is named styles.css
import Endpoints from '../Endpoints';
import { useNavigate } from 'react-router-dom';
import { BookImage } from '../Components/BookImage.js';

export function Catalog() {
    // State for search query and selected genre
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('');
    const [books, setBooks] = useState([]);
    const [open, setOpen] = useState(false);
    const [snackbarText, setSnackbarText]  = useState("");

    useEffect(() => {
        Endpoints.doGetBooks().then(response => {
            if(!response.ok) {
                throw "Response Failure"
            }
            return response.json();
        }).then(json => {
            setBooks(json);
        }).catch(e => {
            console.log(e);
            setSnackbarText("Server Unable to Send Book Data");
            setOpen(true);
        });
    }, [])

    // Filter books based on search query and selected genre
    const filteredBooks = books.filter(book =>
        (book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.author.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (selectedGenre === '' || book.genre === selectedGenre)
    );

    // Array of available genres
    const genres = [
        'Fiction', 'Non-fiction', 'Mystery', 'Thriller', 'Science Fiction',
        'Fantasy', 'Biography', 'History', 'Romance', 'Horror'
    ];

    return (





        <div className="catalog-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Search Bar */}
            <TextField
                label="Search by Title or Author"
                variant="outlined"
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <IconButton>
                                <SearchIcon />
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
                style={{ marginBottom: '20px', width: '100%', maxWidth: '1150px' }}
            />

            {/* Genre Filter Dropdown */}
            <TextField
                select
                label="Filter by Genre"
                variant="outlined"
                size="small"
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                style={{ marginBottom: '20px', width: '100%', maxWidth: '1150px' }}
            >
                <MenuItem value="">All</MenuItem>
                {genres.map((genre, index) => (
                    <MenuItem key={index} value={genre}>{genre}</MenuItem>
                ))}
            </TextField>

            {/* Display Filtered Books */}
            <Grid container spacing={2}>
                {filteredBooks.map((book, index) => (
                    <Grid item xs={4} key={index}>
                        <div className="book-container" onClick={() => { navigate('/BookInformation/'+book._id); }}>
                            {/*<BookIcon fontSize="large" />*/}
                            <BookImage book={book}/>
                            <Typography variant="h6">{book.title}</Typography>
                            <Typography variant="subtitle1">{book.author}</Typography>
                            <Typography variant="subtitle2">{book.genre}</Typography>
                        </div>
                    </Grid>
                ))}
            </Grid>

            <Snackbar
                    open={open}
                    autoHideDuration={60000}
                    onClose={() => setOpen(false)}
                    message={snackbarText}
                />
        </div>
    );
}
