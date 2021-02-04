import React, { Component } from "react";
import { Button, Col, Modal, Row } from "react-bootstrap";
import Form from "../../common/Form";
import uploadIcon from "../../../assets/img/uploadImg.png";
import videoIcon from "../../../assets/img/uploadVid.png";
import Joi from "joi";
import config from "config";
import Axios from "axios";
import Auth from "components/Services/Auth";
import ReactPlayer from "react-player";
import { toast } from "react-toastify";

import AvatarEditor from 'react-avatar-editor';

class DrillModal extends Form {
	state = {
		data: {
			thumbnail: "",
			name: "",
			categoryId: "",
			athleteId: "",
			difficultyLevelId: "",
		//	description: "",
		},
		thumbnailPreview: null,
		categories: [],
		athletes: [],
		speedLevels: [],
		difficultyLevels: [],
		errors: {},
		imageData: null,
		userProfilePic: '',
		editor: null,
		scaleValue: 1,
		imageSelectionStatus: false,
		imgFileName:"",
		captureStatus: false
	};

	schema = Joi.object({
		name: Joi.string().required().label("Name"),
		categoryId: Joi.string().required().label("Category"),
		athleteId: Joi.string().required().label("Athlete"),
		difficultyLevelId: Joi.string().required().label("Difficulty Level"),
	//	description: Joi.string().required().label("Description"),
		thumbnail: Joi.object().required().label("Thumbnail"),
	});

	handleImageChange = (e) => {
		
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

			  } else {
					this.setState({
						data: {
							...this.state.data,
							thumbnail: "",
						},
						thumbnailPreview: null,
					});
				  this.setState({ errors: { thumbnail: "The file type ." + e.target.files[0].name.split(".").pop() + " is not supported" } });
			  }



		}

	};

	handleVideoChange = (e) => {
		if (
			e.target.files[0].name
				.split(".")
				.pop()
				.match(/(mp4|avi)$/)
		) {
			this.setState({
				data: {
					...this.state.data,
					video: e.target.files[0],
				},
				videoPreview: URL.createObjectURL(e.target.files[0]),
			});
		} else {
			this.setState({ errors: { video: "The file type ." + e.target.files[0].name.split(".").pop() + " is not supported" } });
		}
	};

	componentDidMount() {
		
		let athletes,
			categories,
			difficultyLevels = [];
		const athleteRequest = Axios.get(`${config.API_URL}/admin/athlete`, {
			headers: {
				Authorization: Auth.getToken(),
			},
		});
		const categoryRequest = Axios.get(`${config.API_URL}/admin/categories`, {
			headers: {
				Authorization: Auth.getToken(),
			},
		});
		const difficultyLevelsRequest = Axios.get(`${config.API_URL}/admin/difficulty`, {
			headers: {
				Authorization: Auth.getToken(),
			},
		});

		Axios.all([athleteRequest, categoryRequest, difficultyLevelsRequest]).then(
			Axios.spread((...responses) => {
				if (responses[0].status === 200) {
					athletes = [...responses[0].data.data.athlete];
				}

				if (responses[1].status === 200) {
					categories = [...responses[1].data.data.category];
				}

				if (responses[2].status === 200) {
					difficultyLevels = [...responses[2].data.data.difficulty];
				}

				this.setState({
					athletes: athletes,
					categories: categories,
					difficultyLevels: difficultyLevels,
				});
			})
		);
	}

	doSubmit = () => {
		const { data } = this.state;
		let thumbnailFormData = new FormData();
		thumbnailFormData.append("thumbnail", data.thumbnail);
		Axios.post(`${config.API_URL}/admin/drills/upload`, thumbnailFormData, {
			headers: {
				Authorization: Auth.getToken(),
				"Content-Type": "multipart/form-data",
			},
		})
			.then((thumbnailResponse) => {
				const thumbnailImage = thumbnailResponse.data.data.videos.thumbnail;
				let response = {
					name: data.name,
					athlete: data.athleteId,
					category: data.categoryId,
					difficultyLevel: data.difficultyLevelId,
					isPremium: true,
					thumbnail: thumbnailImage,
					videos: [],
				};
				Axios.post(`${config.API_URL}/admin/drills`, response, {
					headers: {
						Authorization: Auth.getToken(),
						"Content-Type": "application/json",
					},
				})
					.then((drillResponse) => {
						if (drillResponse.status === 200) {
							toast.success("Drill has been create successfully.");
							this.props.handleAddDrill();
						}
					})
					.catch((error) => {
						console.log(error);
					});
			})
			.catch((error) => console.log(error));
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
				thumbnail: imgfile
			},

			captureStatus: true,

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
		const { onClose, isAddModalOpen } = this.props;
		const { data, categories, athletes, difficultyLevels, errors, thumbnailPreview, videoPreview } = this.state;

		return (
			<Modal show={isAddModalOpen} onHide={onClose} backdrop="static" dialogClassName="modal-90w">
				<form onSubmit={this.handleSubmit}>
					<Modal.Header closeButton>
						<Modal.Title>Drill</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<Row>
							<Col md={10} mdOffset={1}>
								<Row>
									<div className='col-md-12'>
										<div className='form-group text-center'>

										{(this.state.imageSelectionStatus == true)?
												<div>
													
													<div style={{width:"100%", padding:"10px", border: "3px dashed #1B1D32",  marginRight: "20px", marginLeft: "20px", display: "flex", justifyContent: "center", alignItems: "center", 
													alignContent: "center", alignSelf:"center"}}>
														
									
																											
														<div className="row">
	
															<div className="col-lg-12">
																<AvatarEditor image={this.state.selectedImage} border = {30} width={660} height={290} scale={this.state.scaleValue} rotate={0} ref={this.setEditorRef} className="cropCanvas" />
																<input style={{ width: '100%', backgroundColor: "#1B1D32" }} type="range" value={this.state.scaleValue} name="points" min="1" max="10" onChange={this.onScaleChange} className="multi-range" />

															</div>
														</div>
																
				

													</div>


														<br/>
														<br/>
				
														<div className="row">
															<div className="col-lg-8" >
																<div className="row" style={{display: "flex", justifyContent: "center", alignItems: "center", alignContent: "center", alignSelf:"center"}}>
																	<div>
																			
																			{(this.state.userProfilePic === undefined || this.state.userProfilePic === "null" || this.state.userProfilePic === "") ? (
																				<img src={uploadIcon} style={{ width: "223", height: "120px"}}  />
																				) : (
																					<img src={this.state.userProfilePic} style={{ wwidth: "223", height: "120px"}} onError={(e)=>{e.target.src=uploadIcon}}/>
																				)
																			}
																	</div>
																</div>
															</div>
															<div className="col-lg-4" >
																<input
																type='file'
																className='form-control'
																style={{ display: "none" }}
																ref={(fileInput) => (this.fileInput = fileInput)}
																onChange={this.handleImageChange}
																/>

																

																{errors.thumbnail && <span className='text-danger'>{errors.thumbnail}</span>}
																<br/>
																<a href='#' className='btn btn-dark' onClick={() => this.fileInput.click()}>
																	Upload Thumbnail
																</a>
																<br/>
																<br/>

																<button onClick={this.onCrop} className="  btn btn-dark">
																	Capture
																</button>

															</div>

														</div>

													

												</div>
	
												
												: ""}
	
	
												{(this.state.imageSelectionStatus == false)? 
													
													<div>
														
															{(this.state.userProfilePic === undefined || this.state.userProfilePic === "null" || this.state.userProfilePic === "") ? (
																<img src={uploadIcon} style={{ width: "700px", height: "350px"}}  />
																) : (
																	<img src={this.state.userProfilePic} style={{ wwidth: "700px", height: "350px"}} onError={(e)=>{e.target.src=uploadIcon}}/>
																)
															}
		
															<input
																type='file'
																className='form-control'
																style={{ display: "none" }}
																ref={(fileInput) => (this.fileInput = fileInput)}
																onChange={this.handleImageChange}
															/>
															{errors.thumbnail && <span className='text-danger'>{errors.thumbnail}</span>}
															<br/>
															<br/>
															<a href='#' className='btn btn-dark' onClick={() => this.fileInput.click()}>
																Upload Thumbnail
															</a>
	
													</div> : "" }


										
								
											
											
										</div>
									</div>
								</Row>
								<Row>
									<div className='col-md-6 col-sm-6 col-xs-12'>
										<div className='form-group'>
											<input
												type='text'
												placeholder='Enter Drill Name'
												className='form-control'
												name='name'
												onChange={this.handleOnChange}
												value={data.name}
											/>
											{errors.name && <span className='text-danger'>{errors.name}</span>}
										</div>
									</div>
									<div className='col-md-6 col-sm-6 col-xs-12'>
										<div className='form-group'>
											<select className='form-control' name='athleteId' value={data.ethleteId} onChange={this.handleOnChange}>
												<option value=''>Select Athlete</option>
												{athletes && athletes.length > 0
													? athletes.map((athlete, index) => {
															return (
																<option value={athlete._id} key={`athlete-${index}`}>
																	{athlete.name}
																</option>
															);
													  })
													: ""}
											</select>
											{errors.athleteId && <span className='text-danger'>{errors.athleteId}</span>}
										</div>
									</div>
								</Row>
								<Row>
									<div className='col-md-6 col-sm-6 col-xs-12'>
										<div className='form-group'>
											<select className='form-control' name='categoryId' value={data.categoryId} onChange={this.handleOnChange}>
												<option value=''>Select Catagory</option>
												{categories && categories.length > 0
													? categories.map((category, index) => {
															return (
																<option value={category._id} key={`category-${index}`}>
																	{category.name}
																</option>
															);
													  })
													: ""}
											</select>
											{errors.categoryId && <span className='text-danger'>{errors.categoryId}</span>}
										</div>
									</div>

									<div className='col-md-6 col-sm-6 col-xs-12'>
										<div className='form-group'>
											<select
												className='form-control'
												name='difficultyLevelId'
												value={data.difficultyLevelId}
												onChange={this.handleOnChange}
											>
												<option value=''>Select Difficulty</option>
												{difficultyLevels && difficultyLevels.length > 0
													? difficultyLevels.map((difficultyLevel, index) => {
															return (
																<option value={difficultyLevel._id} key={`category-${index}`}>
																	{difficultyLevel.name}
																</option>
															);
													  })
													: ""}
											</select>
											{errors.difficultyLevelId && <span className='text-danger'>{errors.difficultyLevelId}</span>}
										</div>
									</div>
								</Row>
 							</Col>
						</Row>
					</Modal.Body>
					<Modal.Footer>
						<div className="col-lg-3">
							
						</div>

						<div className="col-lg-6">
							<Button className='btn-dark' style={{marginLeft: "auto"}} type='submit' size='lg' block>
								Add Drill
							</Button>
						</div>

						<div className="col-lg-3">
							
						</div>
			
					</Modal.Footer>
				</form>
			</Modal>
		);
	}
}

export default DrillModal;
