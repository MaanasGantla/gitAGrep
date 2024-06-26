import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Button,
    Container,
    CssBaseline,
    TextField,
    Grid,
    Box,
    Typography,
    Snackbar,
    CircularProgress,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Endpoints from '../Endpoints';
import logo from '../Assets/bruinBookExchangeLogo.png';

const largeLogoStyle = {
    height: '200px', 
    margin: '20px auto 0', 
    display: 'block'
};

const theme = createTheme();

export function CreateAccount() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [snackbarText, setSnackbarText] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        if(formData.password !== formData.confirmPassword) {
            setSnackbarText("Please Ensure you Typed your Password Correctly");
            setOpen(true);
            setLoading(false);
            return;
        }

        Endpoints.doRegister(formData.email, formData.username, formData.password).then(async (response) => {
            if(!response.ok) {
                throw (await response.json());
            }
            setSnackbarText("Account Created Successfully");
            setOpen(true);
            setLoading(false);
            navigate('/Login');
        })
        .catch(e => {
            setSnackbarText(e["reason"] || "Internal Error");
            setOpen(true);
            setLoading(false);
        });
    };

    return (
        <ThemeProvider theme={theme}>
            <Container component="main" maxWidth="xs">
                <CssBaseline />
                <Box
                    sx={{
                        marginTop: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <img src={logo} alt="Logo" style={largeLogoStyle} />

                    <Typography component="h1" variant="h5">
                        Create Account
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    id="username"
                                    label="Username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    id="email"
                                    label="Email Address"
                                    name="email"
                                    autoComplete="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    name="password"
                                    label="Password"
                                    type="password"
                                    id="password"
                                    autoComplete="new-password"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    name="confirmPassword"
                                    label="Confirm Password"
                                    type="password"
                                    id="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />
                            </Grid>
                        </Grid>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Sign Up'}
                        </Button>
                    </Box>
                </Box>
                <Snackbar
                    open={open}
                    autoHideDuration={6000}
                    onClose={() => setOpen(false)}
                    message={snackbarText}
                />
            </Container>
        </ThemeProvider>
    );
}

/*
export function CreateAccount(){
    return(
        <>
            <h1> This is the create account page. </h1>
        </>
    )
}
*/