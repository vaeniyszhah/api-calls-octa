import { useEffect, useState } from "react";
import axios from 'axios';

const API_URL = 'https://serverless-api-octa.netlify.app/.netlify/functions/api/';

function DataForm() {
    const [data, setData] = useState([]);
    const [nameSearch, setNameSearch] = useState('');
    const [cuisineFilter, setCuisineFilter] = useState('');
    const [name, setName] = useState('');
    const [ingredients, setIngredients] = useState('');
    const [steps, setSteps] = useState('');
    const [cuisine, setCuisine] = useState('');
    const [error, setError] = useState(null);
    const [editItem, setEditItem] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [favorites, setFavorites] = useState([]);
    const [categories, setCategories] = useState([]);
    const [showCategories, setShowCategories] = useState(false);

    useEffect(() => {
        axios
            .get(API_URL)
            .then((response) => {
                setData(response.data);
                setCategories([...new Set(response.data.map(item => item.cuisine))]);
            })
            .catch((error) => {
                console.error('There was an error!', error);
            });
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!name || !ingredients || !steps || !cuisine) {
            setError('Name, ingredients, steps, and cuisine are required');
            return;
        }

        const url = editItem ? `${API_URL}/${editItem._id}` : API_URL;
        const method = editItem ? 'put' : 'post';

        axios[method](url, { name, ingredients, steps, cuisine })
            .then((response) => {
                console.log(response.data);

                if (editItem) {
                    setData(
                        data.map((item) =>
                            item._id === editItem._id ? response.data : item
                        )
                    );
                } else {
                    setData([...data, response.data]);
                }
                setName('');
                setIngredients('');
                setSteps('');
                setCuisine('');
                setEditItem(null);
                setError(null);
                setShowModal(false);
            })
            .catch(() => {
                setError('Recipe already exists!');
            });
    };

    const handleEdit = (_id) => {
        const itemToEdit = data.find((item) => _id === item._id);
        setEditItem(itemToEdit);
        setName(itemToEdit.name);
        setIngredients(itemToEdit.ingredients);
        setSteps(itemToEdit.steps);
        setCuisine(itemToEdit.cuisine);
        setShowModal(true);
    };

    const handleDelete = (_id) => {
        axios
            .delete(`${API_URL}/${_id}`)
            .then(() => {
                setData(data.filter((item) => item._id !== _id));
            })
            .catch(() => {
                setError('Recipe does not exist!');
            });
    };

    const handleCategoryChange = (category) => {
        if (category === "All") {
            setNameSearch('');
            setCuisineFilter('');
        } else {
            setCuisineFilter(category);
        }
        setShowCategories(false);
    };

    const toggleFavorite = (itemId) => {
        const selectedItem = data.find(item => item._id === itemId);
        const isFavorite = favorites.some(item => item._id === itemId);

        if (isFavorite) {
            const updatedFavorites = favorites.filter(item => item._id !== itemId);
            setFavorites(updatedFavorites);
        } else {
            setFavorites(prevFavorites => [...prevFavorites, selectedItem]);
        }
    };

    return (
        <div>
            <div className="modal-button">
                <button onClick={() => setShowModal(true)}>Add Data</button>
            </div>

            {showModal && <div className="modal-overlay"></div>}

            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={() => setShowModal(false)}>&times;</span>
                        <form className="add-form" onSubmit={handleSubmit}>
                            <div className="form-row">
                                <input
                                    type='text'
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder='Name'
                                />
                                <input
                                    type="text"
                                    value={ingredients}
                                    onChange={(e) => setIngredients(e.target.value)}
                                    placeholder="Ingredients"
                                />
                                <input
                                    type="text"
                                    value={steps}
                                    onChange={(e) => setSteps(e.target.value)}
                                    placeholder="Steps"
                                />
                                <input
                                    type="text"
                                    value={cuisine}
                                    onChange={(e) => setCuisine(e.target.value)}
                                    placeholder="Cuisine"
                                />
                            </div>
                            {error && <div className="error-message">{error}</div>}
                            <button className="searchButton" type="submit">{editItem ? 'Update Data' : 'Add Data'}</button>
                        </form>
                    </div>
                </div>
            )}

            <div className="search-bar-container">
                <input
                    className="input-design"
                    type="text"
                    placeholder="Search Recipes"
                    value={nameSearch}
                    onChange={(e) => setNameSearch(e.target.value)}
                />
                <div className="category-dropdown">
                    <button className="category-button" onClick={() => setShowCategories(!showCategories)}>Categories</button>
                    {showCategories && (
                        <div className="category-list">
                            <button onClick={() => handleCategoryChange("All")}>All</button>
                            {categories.map(category => (
                                <button key={category} onClick={() => handleCategoryChange(category)}>{category}</button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {favorites.length > 0 && (
                <div>
                    <h2>Favorites</h2>
                    <div className="item-container">
                        {favorites.map(item => (
                            <div key={item._id} className="item-box-2">
                                <button onClick={() => toggleFavorite(item._id)}>
                                    <span role="img" aria-label="heart">❤️</span>
                                </button>
                                <div className="recipeName">
                                <div>
                                    <strong>Name:</strong> {item.name}
                                </div>
                                <div>
                                    <strong>Ingredients:</strong> {item.ingredients}
                                </div>
                                <div>
                                    <strong>Steps:</strong> {item.steps}
                                </div>
                                <div>
                                    <strong>Cuisine:</strong> {item.cuisine}
                                </div>

                                </div>
                               
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <h2>Recipes</h2>
            <div className="item-container">
                {data.filter((item) => {
                    const nameMatch = nameSearch === '' || item.name.toLowerCase().includes(nameSearch.toLowerCase());
                    const cuisineMatch = cuisineFilter === '' || item.cuisine.toLowerCase() === cuisineFilter.toLowerCase();
                    return nameMatch && cuisineMatch;
                })
                .map((item) => (
                    <div key={item._id} className="item-box-1">
                        <div className="buttons">
                            <button onClick={() => handleEdit(item._id)}>Edit</button>
                            <button onClick={() => handleDelete(item._id)}>Delete</button>
                            <button onClick={() => toggleFavorite(item._id)}>
                                <span role="img" aria-label="heart">❤️</span>
                            </button>
                        </div>
                        <div className="recipeName">
                                <div>
                                    <strong>Name:</strong> {item.name}
                                </div>
                                <div>
                                    <strong>Ingredients:</strong> {item.ingredients}
                                </div>
                                <div>
                                    <strong>Steps:</strong> {item.steps}
                                </div>
                                <div>
                                    <strong>Cuisine:</strong> {item.cuisine}
                                </div>

                                </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default DataForm;
