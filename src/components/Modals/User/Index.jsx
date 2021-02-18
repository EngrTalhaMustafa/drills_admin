import React, { Component } from "react";
import Form from "../../common/Form";
import Joi from "joi";
import { Button, Col, Modal, Row } from "react-bootstrap";
import AddIcon from "../../../assets/img/add.png";
import UserAvatar from "../../../assets/img/default-avatar.png";
import config from "../../../config";
import axios from "axios";
import { toast } from "react-toastify";
import moment from "moment";

import AvatarEditor from 'react-avatar-editor';
import Uploader from '../../../services/uploader';

class UserModal extends Form {
	state = {
		data: {
			firstName: "",
			lastName: "",
			email: "",
			password: "",
			confirm_password: "",
			roles: ["user"],
			userName: "",
			image: null,
		},
		activity: [],
		message: {
			email: "",
		},
		errors: {},
		imagePreview: "",
		disableButton: false,
		edit: false,
		view: false,
		close: false,
		showview: true,
		// profileImgWidth: 200,
		// profileImgHeight: 200,
		userProfilePic: '',
		editor: null,
		scaleValue: 1,
		imageSelectionStatus: false,
		imgFileNamee: ""
	};

	schema = Joi.object({
		firstName: Joi.string().required().label("First Name"),
		lastName: Joi.string().required().label("Last Name"),
		email: Joi.string()
			.email({ tlds: { allow: false } })
			.required()
			.label("Email"),
		password: Joi.string().required().min(6).label("Password"),
		confirm_password: Joi.any().valid(Joi.ref("password")).label("Confirm Password"),
		userName: Joi.string().required().label("Username"),
		image: Joi.allow(""),
		roles: Joi.array().required(),
	});

	updatedUserSchema = Joi.object({
		firstName: Joi.string().required().label("First Name"),
		lastName: Joi.string().required().label("Last Name"),
		email: Joi.string()
			.email({ tlds: { allow: false } })
			.required()
			.label("Email"),
		userName: Joi.string().required().label("Username"),
		image: Joi.allow(""),
		roles: Joi.array().required(),
	});

	//function for validation
	validate = () => {
		let { error } = this.schema.validate(this.state.data);
		//if not error
		if (!error) return null;
		const errors = {};
		//loop through validator error and add in errors const according to data fields
		error.details.map((detail) => {
			errors[detail.path[0]] = detail.message;
		});

		return errors;
	};

	validateUpdate = () => {
		let { error } = this.updatedUserSchema.validate(this.state.data);
		//if not error
		if (!error) return null;
		const errors = {};
		//loop through validator error and add in errors const according to data fields
		error.details.map((detail) => {
			errors[detail.path[0]] = detail.message;
		});

		return errors;
	};


	handleImageUserChange = (e) => {


		if (e.target.files[0].name !== null) {

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
							fileUploadErrors: [],
							imageSelectionStatus: true,
							imgFileNamee: file.name
						});
						this.setState({ errors: {} });

					};


					var reader = new FileReader();
					reader.onloadend = function (ended) {
						img.src = ended.target.result;
					}
					reader.readAsDataURL(e.target.files[0]);
				}

			} else {
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


		// if(e.target.files[0].name !== null)
		// {

		// 	if (
		// 		e.target.files[0].name
		// 			.split(".")
		// 			.pop()
		// 			.match(/(jpg|jpeg|png)$/)
		// 	  ) {

		// 		if (e.target.files && e.target.files[0]) {
		// 			var file = e.target.files[0];
		// 			var img = document.createElement("img");
		// 			this.state.backgroundImageFile = e.target.files[0];

		// 			img.onload = () => {

		// 				if(img.width == this.state.profileImgWidth && img.height == this.state.profileImgHeight)
		// 				{
		// 					this.setState({
		// 						data: {
		// 							...this.state.data,
		// 							image: file,
		// 						},
		// 						imagePreview: URL.createObjectURL(file),
		// 					});
		// 					this.setState({ errors: { } });
		// 				}else{


		// 					this.setState({
		// 						data: {
		// 							...this.state.data,
		// 							image: null,
		// 						},
		// 						imagePreview: "",
		// 					});
		// 				  this.setState({ errors: { image: "The file size must be width x height :"+this.state.profileImgWidth + " x "+this.state.profileImgHeight} });
		// 				}
		// 			  };


		// 			var reader = new FileReader();
		// 			  reader.onloadend = function (ended) {
		// 			  img.src = ended.target.result;
		// 			}
		// 		  reader.readAsDataURL(e.target.files[0]);
		// 		  }

		// 	} else 
		// 	{
		// 		this.setState({
		// 			data: {
		// 				...this.state.data,
		// 				image: null,
		// 			},
		// 			imagePreview: "",
		// 		});
		// 		this.setState({ errors: { image: "The file type ." + e.target.files[0].name.split(".").pop() + " is not supported" } });
		// 	}



		// }

	};


	handleSubmit = (e) => {
		e.preventDefault();
		let errors;
		if (this.state.edit) {
			errors = this.validateUpdate();
		} else {
			errors = this.validate();
		}
		//call the validator function
		// let errors = this.validate();
		//set the errors in the state
		this.setState({
			errors: errors || {},
		});

		//if has error return, we don't want to submit form
		if (errors) return;

		this.doSubmit(e.target);
	};
	getActivity = () => {
		const { activity, imagePreview } = this.state
		return (
			activity.map((data, i) => {

				return <li style={{ margin: "10px", listStyle: "none", background: "black", color: "white", padding: "5px" }} key={i}>

					{(imagePreview === undefined || imagePreview === "null" || imagePreview === "") ? (
						<img src={UserAvatar} style={{ width: "50px", height: "50px", borderRadius: "50%" }} />
					) : (
							<img src={imagePreview} style={{ width: "50px", height: "50px", borderRadius: "50%" }} onError={(e) => { e.target.src = UserAvatar }} />
						)
					}



					<p style={{ display: "inline-block", paddingLeft: "20px" }}>{(data.drill_id == null) ? "Unknown Drill" : data.drill_id.name} - {data.user_id.userName}</p>

					<p style={{ display: "inline-block", paddingLeft: "200px" }}>{moment(data.createdAt).fromNow()}</p>
				</li>
			})

		)


	}
	viewData = () => {
		const { data, errors, disableButton, imagePreview } = this.state;
		return (
			<div>
				<Row>
					<div className='form-group'>
						<div className='text-center'>

							{(imagePreview === undefined || imagePreview === "null" || imagePreview === "") ? (
								<img src={UserAvatar} style={{ width: "150px", height: "150px", borderRadius: "50%" }} />
							) : (
									<img src={imagePreview} style={{ width: "150px", height: "150px", borderRadius: "50%" }} onError={(e) => { e.target.src = UserAvatar }} />
								)
							}



						</div>
					</div>
				</Row>
				{errors.image && (
					<Row className='text-center'>
						<span className='text-danger'>{errors.image}</span>
					</Row>
				)}
				<Row>
					<Col md={6} sm={12}>
						<div className='form-group'>
							<input style={{ color: "black" }} type='text' className='form-control' value={data.firstName} disabled />
						</div>
					</Col>

					<Col md={6} sm={12}>
						<div className='form-group'>
							<input style={{ color: "black" }} value={data.lastName} type='text' className='form-control' disabled />
						</div>
					</Col>
				</Row>
				<Row>
					<Col md={6} sm={12}>
						<div className='form-group'>
							<input style={{ color: "black" }} value={data.email} type='email' className='form-control' disabled />
						</div>
					</Col>
					<Col md={6} sm={12}>
						<div className='form-group'>
							<input
								type='text'
								className='form-control'
								value={data.userName}
								name='userName'
								onChange={this.handleOnChange}
								disabled
							/>
							{errors.userName && <span className='text-danger'>{errors.userName}</span>}
						</div>
					</Col>
				</Row>
			</div>
		)
	}
	getData = () => {
		const token = localStorage.getItem("token");
		axios.get(`${config.API_URL}/admin/activity/${this.props.id}`, {
			headers: {
				Authorization: token,
			}
		}).then((response) => {
			this.setState({
				activity: response.data.activity
			})
		})
		axios
			.get(`${config.API_URL}/admin/users/${this.props.id}`, {
				headers: {
					Authorization: token,
				},
			})
			.then((response) => {
				let { user } = response.data.data;
				this.setState({
					data: {
						firstName: user.firstName,
						lastName: user.lastName,
						email: user.email,
						userName: user.userName,
						roles: ["user"],
					},
					...user.imageURL && {
						imagePreview: user.imageURL
					},
				});
			});
	}

	componentDidMount() {
		if (this.props.selection === "view") {
			this.setState({
				view: true,
			});
		}
		if (this.props.selection === "edit") {
			this.setState({
				edit: true,
			});
		}
		if (this.props.selection === "edit" || this.props.selection === "view") {
			this.getData();
		}
	}

	doSubmit = async (e) => {
		alert(1)
		const token = localStorage.getItem("token");
		const data = this.state.data;

		let message = "";
		if (this.props.selection === "edit") {
			if (this.state.data.image !== undefined) {
				console.log(this.state.imgFileNamee)
				let imageData = await Uploader({ file: this.state.data.image, name: this.state.imgFileNamee, path: 'profile-images' });
				const formdata = new FormData();
				formdata.append("firstName", this.state.data.firstName);
				formdata.append("lastName", this.state.data.lastName);
				formdata.append("email", this.state.data.email);
				formdata.append("userName", this.state.data.userName);
				formdata.append("imageURL", imageData.url);

				await axios(`${config.API_URL}/admin/users/${this.props.id}`, {
					method: "POST",
					headers: {
						"content-type": "multipart/form-data",
						Authorization: token,
					},
					data: formdata,
				})
					.then((response) => {
						if (response.data.success) {
							this.setState({
								close: true,
								message: { email: "" },
							});
						} else if (response.data.success === false) {
							if (response.data.errors.email) {
								this.setState({
									message: { email: response.data.errors.email.message },
								});
							}
						}
					})
					.catch((error) => {
						throw error;
					});
			} else {
				const formdata = new FormData();
				formdata.append("firstName", this.state.data.firstName);
				formdata.append("lastName", this.state.data.lastName);
				formdata.append("email", this.state.data.email);
				formdata.append("userName", this.state.data.userName);

				await axios(`${config.API_URL}/admin/users/${this.props.id}`, {
					method: "POST",
					headers: {
						"content-type": "multipart/form-data",
						Authorization: token,
					},
					data: formdata,
				}).then((response) => {
					if (response.data.success) {
						this.setState({
							close: true,
							message: { email: "" },
						});
					} else if (response.data.success === false) {
						if (response.data.errors.email) {
							this.setState({
								message: { email: response.data.errors.email.message },
							});
						}
					}
				});
			}
			message = "User has been edit successfully";
		} else if (this.props.selection === "add") {
			if (this.state.data.image !== undefined) {
				let imageData = await Uploader({ file: this.state.data.image, name: this.state.imgFileNamee, path: 'profile-images' });
				const formdata = new FormData();
				formdata.append("firstName", this.state.data.firstName);
				formdata.append("lastName", this.state.data.lastName);
				formdata.append("email", this.state.data.email);
				formdata.append("password", this.state.data.password);
				formdata.append("confirm_password", this.state.data.confirm_password);
				formdata.append("roles", this.state.data.roles);
				formdata.append("userName", this.state.data.userName);
				formdata.append("imageURL", imageData.url);

				await axios(`${config.API_URL}/signup`, {
					method: "POST",
					headers: {
						"content-type": "multipart/form-data",
					},
					data: formdata,
				})
					.then((response) => {
						if (response.data.success) {
							this.setState({
								close: true,
								message: { email: "" },
							});
						} else if (response.data.success === false) {
							if (response.data.errors.email) {
								this.setState({
									message: { email: response.data.errors.email.message },
								});
							} else if (response.data.errors.password)
								this.setState({
									message: { email: response.data.errors.password.message },
								});
						}
					})

					.catch((error) => {
						throw error;
					});
			} else {
				const formdata = new FormData();
				formdata.append("firstName", this.state.data.firstName);
				formdata.append("lastName", this.state.data.lastName);
				formdata.append("email", this.state.data.email);
				formdata.append("password", this.state.data.password);
				formdata.append("confirm_password", this.state.data.confirm_password);
				formdata.append("roles", this.state.data.roles);
				formdata.append("userName", this.state.data.userName);
				await axios(`${config.API_URL}/signup`, {
					method: "POST",
					headers: {
						"content-type": "multipart/form-data",
					},
					data: formdata,
				})
					.then((response) => {
						if (response.data.success) {
						} else if (response.data.success === false) {
							if (response.data.errors.email) {
								this.setState({
									message: { email: response.data.errors.email.message },
								});
							}
							if (response.data.errors.password)
								this.setState({
									message: { email: response.data.errors.password.message },
								});
						}
					})

					.catch((error) => {
						throw error;
					});
			}
			message = "User has been add successfully";
		}
		this.props.getAllData();
		toast.success(message);
		if (this.state.close) {
			this.setState({
				close: false,
			});
			this.props.onClose();
		}
	};


	setEditorRef = editor => this.setState({ editor });

	onCrop = (e) => {
		e.preventDefault();
		const { editor } = this.state;
		if (editor !== null) {
			const url = editor.getImageScaledToCanvas().toDataURL();
			const imgfile = this.DataURLtoFile(url, this.state.imgFileNamee)
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
		const scaleValue = parseFloat(scaleChangeEvent.target.value);
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
		const { onClose, isAddModalOpen } = this.props;
		const { data, errors, disableButton, imagePreview } = this.state;
		return (
			<Modal show={isAddModalOpen} onHide={onClose} backdrop="static">
				<form onSubmit={this.handleSubmit} method='Post' >

					{this.state.edit ? (
						<div>

							<Modal.Header closeButton>
								<Modal.Title>User</Modal.Title>
							</Modal.Header>
							<Modal.Body>
								<Row>
									<div className='form-group'>
										<div className='addBtnArea text-center'>

											{(this.state.imageSelectionStatus == true) ?


												<div style={{
													width: "95%", padding: "10px", border: "3px dashed #1B1D32", marginRight: "20px", marginLeft: "20px", display: "flex", justifyContent: "center", alignItems: "center",
													alignContent: "center", alignSelf: "center"
												}}>
													{/* <ImageCrop
													imageSrc={this.state.selectedImage}
													setEditorRef={this.setEditorRef}
													onCrop={this.onCrop}
													scaleValue={this.state.scaleValue}
													onScaleChange={this.onScaleChange}
													width={200}
													height={200}
													/> */}

													<div className="row">

														<div className="col-lg-6">
															<AvatarEditor image={this.state.selectedImage} border={30} width={200} height={200} scale={this.state.scaleValue} rotate={0} ref={this.setEditorRef} className="cropCanvas" />
															<input style={{ width: '100%', backgroundColor: "#1B1D32" }} type="range" value={this.state.scaleValue} name="points" min="1" max="10" onChange={this.onScaleChange} className="multi-range" />

														</div>

														<div className="col-lg-6" >

															<div className="row" style={{ display: "flex", justifyContent: "center", alignItems: "center", alignContent: "center", alignSelf: "center" }}>
																{(this.state.userProfilePic === undefined || this.state.userProfilePic === "null" || this.state.userProfilePic === "") ? (
																	<img src={UserAvatar} style={{ width: "150px", height: "150px", borderRadius: "50%" }} />
																) : (
																		<img src={this.state.userProfilePic} style={{ width: "150px", height: "150px", borderRadius: "50%" }} onError={(e) => { e.target.src = UserAvatar }} />
																	)
																}

																<input
																	type='file'
																	className='form-control'
																	name="profilePicBtn"
																	style={{ display: "none" }}
																	ref={(fileInput) => (this.fileInput = fileInput)}
																	onChange={this.handleImageUserChange}
																/>

																<button type='button' className='btn btnAdd' onClick={() => this.fileInput.click()}>
																	<img src={AddIcon} alt='' />
																</button>



															</div>

															<div className="row">

																<br />

																<button onClick={this.onCrop} className="editorOverlayCloseBtn  btn btn-dark">
																	Capture
																</button>

															</div>



														</div>


													</div>



													<br />
												</div>



												: ""}


											{(this.state.imageSelectionStatus == false) ?

												<div>

													{(imagePreview === undefined || imagePreview === "null" || imagePreview === "") ? (
														<img src={UserAvatar} style={{ width: "150px", height: "150px", borderRadius: "50%" }} />
													) : (
															<img src={imagePreview} style={{ width: "150px", height: "150px", borderRadius: "50%" }} onError={(e) => { e.target.src = UserAvatar }} />
														)
													}

													<input
														type='file'
														className='form-control'
														name="profilePicBtn"
														style={{ display: "none" }}
														ref={(fileInput) => (this.fileInput = fileInput)}
														onChange={this.handleImageUserChange}
													/>

													<button type='button' className='btn btnAdd' onClick={() => this.fileInput.click()}>
														<img src={AddIcon} alt='' />
													</button>

												</div> : ""}



										</div>
									</div>
								</Row>
								{errors.image && (
									<Row className='text-center'>
										<span className='text-danger'>{errors.image}</span>
									</Row>
								)}

								<Row>
									<Col md={6} sm={12}>
										<div className='form-group'>
											<input
												type='text'
												className='form-control'
												placeholder='Enter First Name'
												name='firstName'
												onChange={this.handleOnChange}
												value={data.firstName}
											/>
											{errors.firstName && <span className='text-danger'>{errors.firstName}</span>}
										</div>
									</Col>

									<Col md={6} sm={12}>
										<div className='form-group'>
											<input
												value={data.lastName}
												type='text'
												className='form-control'
												placeholder='Enter Last Name'
												name='lastName'
												onChange={this.handleOnChange}
											/>
											{errors.lastName && <span className='text-danger'>{errors.lastName}</span>}
										</div>
									</Col>
								</Row>
								<Row>
									<Col md={6} sm={12}>
										<div className='form-group'>
											<input
												value={data.email}
												type='email'
												className='form-control'
												placeholder='Enter Email'
												name='email'
												onChange={this.handleOnChange}
											/>
											{errors.email && <span className='text-danger'>{errors.email}</span>}
										</div>
									</Col>
									<Col md={6} sm={12}>
										<div className='form-group'>
											<input type='text' className='form-control' value={data.userName} name='userName' onChange={this.handleOnChange} />
											{errors.userName && <span className='text-danger'>{errors.userName}</span>}
										</div>
									</Col>
								</Row>
							</Modal.Body>

						</div>
					) : this.state.view ? (
						<div>
							<Modal.Header closeButton>
								<Row>

									<Col md={6}>
										<a class='user-btn' onClick={() => { this.setState({ showview: true }) }} >User Info</a>
									</Col>
									<Col md={6}>
										<a class='user-btn' onClick={() => { this.setState({ showview: false }) }}>Activity</a>
									</Col>
									<hr style={{ marginTop: "28px" }} />
								</Row>

							</Modal.Header>


							<Modal.Body>
								{this.state.showview ? this.viewData() : this.getActivity()}
							</Modal.Body>
						</div>

					) : (
								<div>
									<Modal.Header closeButton>
										<Modal.Title >Add User</Modal.Title>
									</Modal.Header>
									<Modal.Body>
										<Row>
											<div className='form-group'>
												<div className='addBtnArea text-center'>

													{(this.state.imageSelectionStatus == true) ?


														<div style={{
															width: "95%", padding: "10px", border: "3px dashed #1B1D32", marginRight: "20px", marginLeft: "20px", display: "flex", justifyContent: "center", alignItems: "center",
															alignContent: "center", alignSelf: "center"
														}}>
															{/* <ImageCrop
															imageSrc={this.state.selectedImage}
															setEditorRef={this.setEditorRef}
															onCrop={this.onCrop}
															scaleValue={this.state.scaleValue}
															onScaleChange={this.onScaleChange}
															width={200}
															height={200}
															/> */}

															<div className="row">

																<div className="col-lg-6">
																	<AvatarEditor image={this.state.selectedImage} border={30} width={200} height={200} scale={this.state.scaleValue} rotate={0} ref={this.setEditorRef} className="cropCanvas" />
																	<input style={{ width: '100%', backgroundColor: "#1B1D32" }} type="range" value={this.state.scaleValue} name="points" min="1" max="10" onChange={this.onScaleChange} className="multi-range" />

																</div>

																<div className="col-lg-6" >

																	<div className="row" style={{ display: "flex", justifyContent: "center", alignItems: "center", alignContent: "center", alignSelf: "center" }}>
																		{(this.state.userProfilePic === undefined || this.state.userProfilePic === "null" || this.state.userProfilePic === "") ? (
																			<img src={UserAvatar} style={{ width: "150px", height: "150px", borderRadius: "50%" }} />
																		) : (
																				<img src={this.state.userProfilePic} style={{ width: "150px", height: "150px", borderRadius: "50%" }} onError={(e) => { e.target.src = UserAvatar }} />
																			)
																		}

																		<input
																			type='file'
																			className='form-control'
																			name="profilePicBtn"
																			style={{ display: "none" }}
																			ref={(fileInput) => (this.fileInput = fileInput)}
																			onChange={this.handleImageUserChange}
																		/>

																		<button type='button' className='btn btnAdd' onClick={() => this.fileInput.click()}>
																			<img src={AddIcon} alt='' />
																		</button>


																	</div>

																	<div className="row">

																		<br />

																		<button onClick={this.onCrop} className="editorOverlayCloseBtn  btn btn-dark">
																			Capture
																		</button>

																	</div>



																</div>


															</div>



															<br />
														</div>



														: ""}


													{(this.state.imageSelectionStatus == false) ?

														<div>

															{(imagePreview === undefined || imagePreview === "null" || imagePreview === "") ? (
																<img src={UserAvatar} style={{ width: "150px", height: "150px", borderRadius: "50%" }} />
															) : (
																	<img src={this.state.userProfilePic} style={{ width: "150px", height: "150px", borderRadius: "50%" }} onError={(e) => { e.target.src = UserAvatar }} />
																)
															}

															<input
																type='file'
																className='form-control'
																name="profilePicBtn"
																style={{ display: "none" }}
																ref={(fileInput) => (this.fileInput = fileInput)}
																onChange={this.handleImageUserChange}
															/>

															<button type='button' className='btn btnAdd' onClick={() => this.fileInput.click()}>
																<img src={AddIcon} alt='' />
															</button>

														</div> : ""}

												</div>

											</div>
										</Row>
										{errors.image && (
											<Row className='text-center'>
												<span className='text-danger'>{errors.image}</span>
											</Row>
										)}
										<Row>
											<Col md={6} sm={12}>
												<div className='form-group'>
													<input
														type='text'
														className='form-control'
														placeholder='Enter First Name'
														name='firstName'
														onChange={this.handleOnChange}
													/>
													{errors.firstName && <span className='text-danger'>{errors.firstName}</span>}
												</div>
											</Col>

											<Col md={6} sm={12}>
												<div className='form-group'>
													<input
														type='text'
														className='form-control'
														placeholder='Enter Last Name'
														name='lastName'
														onChange={this.handleOnChange}
													/>
													{errors.lastName && <span className='text-danger'>{errors.lastName}</span>}
												</div>
											</Col>
										</Row>
										<Row>
											<Col md={6} sm={12}>
												<div className='form-group'>
													<input
														type='email'
														className='form-control'
														placeholder='Enter Email'
														name='email'
														onChange={this.handleOnChange}
													/>
													{errors.email && <span className='text-danger'>{errors.email}</span>}
												</div>
											</Col>
											<Col md={6} sm={12}>
												<div className='form-group'>
													<input
														type='text'
														className='form-control'
														placeholder='Enter User Name'
														name='userName'
														onChange={this.handleOnChange}
													/>
													{errors.userName && <span className='text-danger'>{errors.userName}</span>}
												</div>
											</Col>
										</Row>
										<Row>
											<Col md={6} sm={12}>
												<div className='form-group'>
													<input
														type='password'
														className='form-control'
														placeholder='Enter Password'
														name='password'
														onChange={this.handleOnChange}
													/>
													{errors.password && <span className='text-danger'>{errors.password}</span>}
												</div>
											</Col>

											<Col md={6} sm={12}>
												<div className='form-group'>
													<input
														type='password'
														className='form-control'
														placeholder='Confirm Password'
														name='confirm_password'
														onChange={this.handleOnChange}
													/>
													{errors.confirmPassword && <span className='text-danger'>{errors.confirmPassword}</span>}
												</div>
											</Col>
										</Row>
									</Modal.Body>
								</div>
							)}
					<p className='text-danger'>{this.state.message.email}</p>

					<Modal.Footer>
						{this.state.view ? (
							""
						) : (
								<Button className='btn-dark' type='submit' size='lg' disabled={disableButton} block>
									Save User
								</Button>
							)}
					</Modal.Footer>
				</form>
			</Modal >
		);
	}
}

export default UserModal;
