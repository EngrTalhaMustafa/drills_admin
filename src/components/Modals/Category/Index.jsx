import React, { Component } from "react";
import { Button, Modal, Row } from "react-bootstrap";
import Form from "../../common/Form";
import AddIcon from "../../../assets/img/add.png";
import CategoryIcon from "../../../assets/img/category.png";
import config from "../../../config";
import Joi from "joi";
import axios from "axios";
import { toast } from "react-toastify";

import AvatarEditor from 'react-avatar-editor';
import Uploader from '../../../services/uploader';

class CategoryModal extends Form {
	state = {
		data: {
			name: "",
			image: "",
		},
		view: false,
		edit: false,
		imagePreview: "",
		errors: {},
		disableButton: false,
		// profileImgWidth: 200,
		// profileImgHeight: 200,
		userProfilePic: '',
		editor: null,
		scaleValue: 1,
		imageSelectionStatus: false,
		imgFileName:""
	};

	schema = Joi.object({
		name: Joi.string().required().label("Name"),
		image: Joi.allow(""),
	});

	

	handleImageCategoryChange = (e) => {
				
		if(e.target.files[0].name !== null)
		{

			if (
				e.target.files[0].name
					.split(".")
					.pop()
					.match(/(jpg|jpeg|png)$/)
			  ) {
					
				if (e.target.files && e.target.files[0]) {
					var file = e.target.files[0];
					var img = document.createElement("img");
					this.state.backgroundImageFile = e.target.files[0];
					
					img.onload = () => {
						
						
						this.setState({
	
							imagePreview: URL.createObjectURL(file),
							openCropper: true, 
							selectedImage: file,
							fileUploadErrors: [] ,
							imageSelectionStatus: true,
							imgFileName: file.name
						});
						this.setState({ errors: { } });


					  };
				  
					var reader = new FileReader();
					  reader.onloadend = function (ended) {
					  img.src = ended.target.result;
					}
				
					reader.readAsDataURL(e.target.files[0]);
				 
				}

			} else 
			{
				this.setState({
					data: {
						...this.state.data,
						image: null,
					},
					imagePreview: "",
				});
				this.setState({ errors: { image: "The file type ." + e.target.files[0].name.split(".").pop() + " is not supported" } });
			}



		}

	};





	componentDidMount() {
		if (this.props.selection === "edit") {
			this.setState({
				edit: true,
			});
		}
		if (this.props.selection === "view") {
			this.setState({
				view: true,
			});
		}
		if (this.props.selection === "edit" || this.props.selection === "view") {
			const token = localStorage.getItem("token");
			axios
				.get(`${config.API_URL}/admin/categories/${this.props.id}`, {
					headers: {
						Authorization: token,
					},
				})
				.then((response) => {
					if (response.data.data.category.imageURL) {
						this.setState({
							data: {
								name: response.data.data.category.name,
								image: response.data.data.category.imageURL,
							},
							imagePreview: response.data.data.category.imageURL,
						});
					} else {
						this.setState({
							data: {
								name: response.data.data.category.name,
							},
						});
					}
				});
		}
	}

	doSubmit = async (e) => {
		const token = localStorage.getItem("token");
		const data = this.state.data;
		let message = "";
		if (this.props.selection === "edit") {
			if (this.state.data.image !== undefined) {
				let imageData = await Uploader({ file: this.state.data.image, name: this.state.imgFileName, path: 'categories/images' });
				const formdata = new FormData();
				formdata.append("name", this.state.data.name);
				formdata.append("imageURL", imageData.url);
				await axios(`${config.API_URL}/admin/categories/${this.props.id}`, {
					method: "POST",
					headers: {
						"content-type": "multipart/form-data",
						Authorization: token,
					},
					data: formdata,
				})
					.then((response) => response)
					.catch((error) => {
						throw error;
					});
			} else {
				const formdata = new FormData();
				formdata.append("name", this.state.data.name);
				axios(`${config.API_URL}/admin/categories/${this.props.id}`, {
					method: "POST",
					headers: {
						"content-type": "multipart/form-data",
						Authorization: token,
					},
					data: formdata,
				})
					.then((response) => response)
					.catch((error) => {
						throw error;
					});
			}
			message = "Category has been added successfully";
		} else if (this.props.selection === "add") {
			if (this.state.data.image !== undefined) {
				let imageData = await Uploader({ file: this.state.data.image, name: this.state.imgFileName, path: 'categories/images' });
				const formdata = new FormData();
				formdata.append("name", this.state.data.name);
				formdata.append("imageURL", imageData.url);
				await axios(`${config.API_URL}/admin/categories`, {
					method: "POST",
					headers: {
						"content-type": "multipart/form-data",
						Authorization: token,
					},
					data: formdata,
				})
					.then((response) => response)
					.catch((error) => {
						throw error;
					});
			} else {
				const formdata = new FormData();
				formdata.append("name", this.state.data.name);
				await axios(`${config.API_URL}/admin/categories`, {
					method: "POST",
					headers: {
						"content-type": "multipart/form-data",
						Authorization: token,
					},
					data: formdata,
				})
					.then((response) => response)
					.then(
						this.setState({
							redirect: true,
						})
					)
					.catch((error) => {
						throw error;
					});
			}
			message = "Category has been updated successfully";
		}
		this.props.getAllData();
		toast.success(message);
		this.props.onClose();
	};


	setEditorRef = editor => this.setState({ editor });

    onCrop = (e) => {
		e.preventDefault();
		const { editor } = this.state;
		if (editor !== null) {
		const url = editor.getImageScaledToCanvas().toDataURL();
		const imgfile = this.DataURLtoFile(url,this.state.imgFileName)
		this.setState({ 
			
			userProfilePic: url,
			data: {
				...this.state.data,
				image: imgfile,
			},

		});



		}

		

	};

	onScaleChange = (scaleChangeEvent) => {
		const scaleValue =  parseFloat(scaleChangeEvent.target.value);
		this.setState({ scaleValue });
	};

	DataURLtoFile = (dataurl, filename) => {
	let arr = dataurl.split(','),
		mime = arr[0].match(/:(.*?);/)[1],
		bstr = atob(arr[1]),
		n = bstr.length,
		u8arr = new Uint8Array(n);
	while (n--) {
		u8arr[n] = bstr.charCodeAt(n);
	}
	return new File([u8arr], filename, { type: mime });
	};



	render() {
		const { data, errors } = this.state;
		const { onClose, isAddModalOpen } = this.props;
		return (
			<Modal show={isAddModalOpen} onHide={onClose} backdrop="static">
				<form onSubmit={this.handleSubmit} method='post'>
					<Modal.Header closeButton>
						<Modal.Title>Category</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						{this.state.view ? (
							<div>
								<div className='form-group'>
									<div className=' text-center'>
						
										{(this.state.imagePreview === undefined || this.state.imagePreview === "null") ? (
												<img src={CategoryIcon} style={{ width: "110px", height: "132px", borderRadius: "5px"}}  />
											) : (
												<img src={this.state.imagePreview} style={{ width: "110px", height: "132px", borderRadius: "5px"}}  onError={(e)=>{e.target.src=CategoryIcon}}/>
											)
											}
										<input
											type='file'
											className='form-control'
											style={{ display: "none" }}
											ref={(fileInput) => (this.fileInput = fileInput)}
											onChange={this.handleImageCategoryChange}
										/>
									</div>
								</div>
								<div className='form-group'>
									<input style={{ color: "black" }} type='text' value={data.name} className='form-control' disabled />
								</div>
							</div>
						) : (
							<div>
								<Row>
									<div className='form-group'>
										<div className='addBtnArea text-center'>
										{(this.state.imageSelectionStatus == true)?
													
													
													<div style={{width:"95%", padding:"10px", border: "3px dashed #1B1D32",  marginRight: "20px", marginLeft: "20px", display: "flex", justifyContent: "center", alignItems: "center", 
													alignContent: "center", alignSelf:"center"}}>

														<div className="row">
	
															<div className="col-lg-6">
																<AvatarEditor image={this.state.selectedImage} border = {30} width={200} height={200} scale={this.state.scaleValue} rotate={0} ref={this.setEditorRef} className="cropCanvas" />
																<input style={{ width: '100%', backgroundColor: "#1B1D32" }} type="range" value={this.state.scaleValue} name="points" min="1" max="10" onChange={this.onScaleChange} className="multi-range" />
	
															</div>
	
															<div className="col-lg-6" >
																
																<div className="row" style={{display: "flex", justifyContent: "center", alignItems: "center", alignContent: "center", alignSelf:"center"}}>
																{(this.state.userProfilePic === undefined || this.state.userProfilePic === "null" || this.state.userProfilePic === "") ? (
																		<img src={CategoryIcon} style={{ width: "150px", height: "150px", borderRadius: "50%"}}  />
																		) : (
																			<img src={this.state.userProfilePic} style={{ width: "150px", height: "150px", borderRadius: "50%"}} onError={(e)=>{e.target.src=CategoryIcon}}/>
																		)
																	}
	
																	<input
																		type='file'
																		className='form-control'
																		name="profilePicBtn"
																		style={{ display: "none" }}
																		ref={(fileInput) => (this.fileInput = fileInput)}
																		onChange={this.handleImageCategoryChange}
																	/>
															
																	<button type='button' className='btn btnAdd' onClick={() => this.fileInput.click()}>
																		<img src={AddIcon} alt='' />
																	</button>
	
																				
	
																</div>
																
																<div className="row">
	
																	<br/>
	
																	<button onClick={this.onCrop} className="editorOverlayCloseBtn  btn btn-dark">
																		Capture
																	</button>
	
																</div>
																																							
														
	
															</div>
	
	
														</div>
	
	
	
														<br/>
													</div>
												
	
												
												: ""}
	
	
												{(this.state.imageSelectionStatus == false)? 
													
													<div>
														
														{(this.state.imagePreview === undefined || this.state.imagePreview === "null" || this.state.imagePreview === "") ? (
															<img src={CategoryIcon} style={{ width: "150px", height: "150px", borderRadius: "50%"}}  />
															) : (
																<img src={this.state.imagePreview} style={{ width: "150px", height: "150px", borderRadius: "50%"}} onError={(e)=>{e.target.src=CategoryIcon}}/>
															)
														}
	
													<input
														type='file'
														className='form-control'
														name="profilePicBtn"
														style={{ display: "none" }}
														ref={(fileInput) => (this.fileInput = fileInput)}
														onChange={this.handleImageCategoryChange}
													/>
											
													<button type='button' className='btn btnAdd' onClick={() => this.fileInput.click()}>
														<img src={AddIcon} alt='' />
													</button>
	
													</div> : "" }
										
										
										
										

										</div>
									</div>
								</Row>
								<Row>
									{errors.image && (
										<Row className='text-center'>
											<span className='text-danger'>{errors.image}</span>
										</Row>
									)}
								</Row>
								<div className='form-group'>
									<input
										type='text'
										className='form-control'
										placeholder='Enter Name'
										onChange={this.handleOnChange}
										name='name'
										value={data.name}
									/>
									{errors.name && <span className='text-danger'>{errors.name}</span>}
								</div>
							</div>
						)}
					</Modal.Body>
					<Modal.Footer>
						{this.state.view ? (
							""
						) : (
							<Button disabled={this.state.disableButton} type='submit' className='btn-dark' size='lg' block>
								Save Category
							</Button>
						)}
					</Modal.Footer>
				</form>
			</Modal>
		);
	}
}

export default CategoryModal;
