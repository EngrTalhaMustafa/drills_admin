import React from 'react';
import PropTypes from 'prop-types';
import AvatarEditor from 'react-avatar-editor';

const ImageCrop = ({ imageSrc, onCrop, setEditorRef, scaleValue, onScaleChange, width, height}) => (
  <div>
      <div className="editorOverlayInner">
        <div className="editorModalContent clearfix">
          <div className="cropCnt">
            
              
       
            
          </div>
        </div>
      </div>
     
  </div>
);

ImageCrop.propTypes = {
  open: PropTypes.bool.isRequired,
  setEditorRef: PropTypes.func.isRequired,
  onCrop: PropTypes.func.isRequired,
  scaleValue: PropTypes.number.isRequired,
  onScaleChange: PropTypes.func.isRequired,
};

export default ImageCrop;
