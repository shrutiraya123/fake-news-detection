import React from 'react';
import { Navbar, Container, Nav, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { Newspaper, ShieldCheck, ChevronDown } from 'react-bootstrap-icons';

function Header({ activeContainer }) {
  const categories = [
    { name: 'Sport', path: '/category/sport' },
    { name: 'World', path: '/category/world' },
    { name: 'Society', path: '/category/society' },
    { name: 'Books', path: '/category/books' },
    { name: 'Life and Style', path: '/category/lifeandstyle' },
    { name: 'Art and Design', path: '/category/artanddesign' },
    { name: 'US News', path: '/category/usnews' },
    { name: 'Comment Is Free', path: '/category/commentisfree' },
    { name: 'Fashion', path: '/category/fashion' },
    { name: 'News', path: '/category/news' },
    { name: 'Education', path: '/category/education' },
    { name: 'Politics', path: '/category/politics' },
    { name: 'TV and Radio', path: '/category/tvandradio' },
    { name: 'Business', path: '/category/business' },
    { name: 'UK News', path: '/category/uknews' },
    { name: 'Environment', path: '/category/environment' },
    { name: 'Football', path: '/category/football' },
  ];

  return (
    <header className='site-header'>
      <Navbar expand='lg' className='news-navbar'>
        <Container fluid='xl'>
          {/* BRAND */}
          <LinkContainer to='/'>
            <Navbar.Brand className='news-brand'>
              <div className='brand-icon'>
                <Newspaper />
              </div>

              <div className='brand-text'>
                <span className='brand-news'>News</span>

                <span className='brand-guardian'>Guardian</span>
              </div>
            </Navbar.Brand>
          </LinkContainer>

          {/* MOBILE TOGGLE */}
          <Navbar.Toggle
            aria-controls='news-navbar'
            className='custom-navbar-toggle'
          >
            <span></span>
            <span></span>
            <span></span>
          </Navbar.Toggle>

          <Navbar.Collapse id='news-navbar' className='justify-content-end'>
            <Nav className='main-navigation'>
              {/* CATEGORIES */}
              <NavDropdown
                title={
                  <span className='categories-link'>
                    News Categories
                    <ChevronDown />
                  </span>
                }
                id='news-categories-dropdown'
                className='categories-dropdown'
              >
                <div className='categories-menu'>
                  <div className='categories-heading'>
                    <ShieldCheck />
                    <span>Browse Categories</span>
                  </div>

                  <div className='categories-grid'>
                    {categories.map((category) => (
                      <LinkContainer key={category.path} to={category.path}>
                        <NavDropdown.Item>{category.name}</NavDropdown.Item>
                      </LinkContainer>
                    ))}
                  </div>
                </div>
              </NavDropdown>

              {/* CHECK NEWS */}
              <LinkContainer to='/checkbytitle'>
                <Nav.Link
                  className={
                    activeContainer === 2
                      ? 'nav-item-custom active'
                      : 'nav-item-custom'
                  }
                >
                  <span>Check News</span>
                </Nav.Link>
              </LinkContainer>

              {/* QUIZ */}
              <LinkContainer to='/newsquiz'>
                <Nav.Link
                  className={
                    activeContainer === 3
                      ? 'nav-item-custom active'
                      : 'nav-item-custom'
                  }
                >
                  <span>News Quiz</span>
                </Nav.Link>
              </LinkContainer>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
}

export default Header;
