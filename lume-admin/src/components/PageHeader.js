import React from 'react';
import PropTypes from 'prop-types';

function PageHeader({ title, description, actions }) {
  return (
    <div className="page-header">
      <div className="page-header-content">
        <div>
          <h1 className="page-title">{title}</h1>
          {description && <p className="page-description">{description}</p>}
        </div>
        {actions && <div className="page-actions">{actions}</div>}
      </div>
    </div>
  );
}

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  actions: PropTypes.node,
};

export default PageHeader;
