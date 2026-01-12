import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from '../../utils/axios';
import ProductCard from '../../components/ProductCard.jsx';

const CategoriesContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
`;

const PageTitle = styled.h1`
  font-size: 36px;
  margin-bottom: 30px;
  color: var(--text-color);
  
  @media (max-width: 768px) {
    font-size: 24px;
    margin-bottom: 20px;
    font-weight: 700;
  }
`;

/* Desktop version - shows products */
const CategorySection = styled.section`
  margin-bottom: 50px;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const CategoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 2px solid var(--border-light);
`;

const CategoryTitle = styled.h2`
  font-size: 28px;
  color: var(--text-color);
  display: flex;
  align-items: center;
  gap: 10px;
  
  i {
    color: var(--btn-primary);
  }
`;

const ViewAll = styled.button`
  background: none;
  border: 2px solid var(--btn-primary);
  color: var(--btn-primary);
  padding: 8px 20px;
  border-radius: 5px;
  font-weight: 500;
  transition: all 0.3s;
  
  &:hover {
    background-color: var(--btn-primary);
    color: white;
  }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 30px;
`;

const NoProducts = styled.div`
  text-align: center;
  padding: 40px;
  color: var(--text-secondary);
  font-size: 18px;
`;

/* Mobile version - shows category cards grid */
const MobileCategoriesGrid = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileCategoryGroup = styled.div`
  margin-bottom: 28px;
`;

const MobileGroupTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 16px;
  padding-left: 4px;
`;

const MobileGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
`;

const MobileCategoryCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: transform 0.2s ease;
  
  &:active {
    transform: scale(0.95);
  }
`;

const MobileCategoryImage = styled.div`
  width: 100%;
  height: 65px;
  background: #f9fafb;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-bottom: 6px;
  
  [data-theme="dark"] & {
    background: rgba(255, 255, 255, 0.08);
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 12px;
  }
  
  svg {
    width: 32px;
    height: 32px;
    color: #10b981;
  }
`;

const MobileCategoryName = styled.span`
  font-size: 10px;
  font-weight: 600;
  color: #374151;
  text-align: center;
  line-height: 1.2;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  
  [data-theme="dark"] & {
    color: #e5e7eb;
  }
`;

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [categoryProducts, setCategoryProducts] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/categories');
      setCategories(response.data);

      // Fetch products for each category (for desktop view)
      response.data.forEach(async (category) => {
        try {
          const productsResponse = await axios.get(`/products/category/${category._id}`);
          setCategoryProducts(prev => ({
            ...prev,
            [category._id]: productsResponse.data.slice(0, 4)
          }));
        } catch (error) {
          console.error(`Error fetching products for category ${category.name}:`, error);
        }
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/store?category=${categoryId}`);
  };

  const handleViewAll = (categoryId) => {
    navigate(`/store?category=${categoryId}`);
  };

  const categoryIcons = {
    'Fruits & Vegetables': 'expDel_fruits',
    'Dairy & Eggs': 'expDel_dairy',
    'Beverages': 'expDel_beverages',
    'Snacks': 'expDel_snacks',
    'Cooking Essentials': 'expDel_cooking',
    'Personal Care': 'expDel_personal',
    'Bakery': 'expDel_bakery',
    'Frozen Foods': 'expDel_frozen',
    'Meat & Fish': 'expDel_meat',
    'Household': 'expDel_household',
  };

  // Group categories for mobile display
  const groupedCategories = categories.reduce((acc, category) => {
    // Simple grouping - you can customize this based on your category structure
    const group = 'All Categories';
    if (!acc[group]) acc[group] = [];
    acc[group].push(category);
    return acc;
  }, {});

  return (
    <CategoriesContainer>
      <PageTitle>All Categories</PageTitle>

      {/* Mobile View - Clean Category Grid */}
      <MobileCategoriesGrid>
        {Object.entries(groupedCategories).map(([groupName, groupCategories]) => (
          <MobileCategoryGroup key={groupName}>
            {groupName !== 'All Categories' && (
              <MobileGroupTitle>{groupName}</MobileGroupTitle>
            )}
            <MobileGrid>
              {groupCategories.map(category => (
                <MobileCategoryCard
                  key={category._id}
                  onClick={() => handleCategoryClick(category._id)}
                >
                  <MobileCategoryImage>
                    {category.image ? (
                      <img
                        src={category.image.startsWith('http') ? category.image : `${category.image.startsWith('/') ? '' : '/'}${category.image}`}
                        alt={category.name}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <path d="M16 10a4 4 0 0 1-8 0" />
                      </svg>
                    )}
                  </MobileCategoryImage>
                  <MobileCategoryName>{category.name}</MobileCategoryName>
                </MobileCategoryCard>
              ))}
            </MobileGrid>
          </MobileCategoryGroup>
        ))}
      </MobileCategoriesGrid>

      {/* Desktop View - Categories with Products */}
      {categories.map(category => (
        <CategorySection key={category._id}>
          <CategoryHeader>
            <CategoryTitle>
              <i className={categoryIcons[category.name] || 'expDel_shopping_basket'}></i>
              {category.name}
            </CategoryTitle>
            <ViewAll onClick={() => handleViewAll(category._id)}>View All</ViewAll>
          </CategoryHeader>

          <ProductGrid>
            {categoryProducts[category._id]?.length > 0 ? (
              categoryProducts[category._id].map(product => (
                <ProductCard key={product._id} product={product} />
              ))
            ) : (
              <NoProducts>No products available in this category</NoProducts>
            )}
          </ProductGrid>
        </CategorySection>
      ))}
    </CategoriesContainer>
  );
};

export default Categories;