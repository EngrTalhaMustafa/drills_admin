import React, { Component } from "react";
import { Button, Col, Modal, Row, ProgressBar } from "react-bootstrap";
import Form from "../../common/Form";
import uploadIcon from "../../../assets/img/uploadImg.png";
import videoIcon from "../../../assets/img/uploadVid.png";
import Joi from "joi";
import config from "config";
import Axios from "axios";
import Auth from "components/Services/Auth";
import ReactPlayer from "react-player";
import { toast } from "react-toastify";
import Uploader from "../../../services/uploader";

import AvatarEditor from 'react-avatar-editor';

class DrillVideoModal extends Form {
	state = {
		data: {
			thumbnail: "",
			video: "",
			speedLevel: "",
			isPremium: "false",
			duration: "",
			createdAt: ""
		},
		videoPreview: null,
		thumbnailPreview: null,
		speedLevels: [],
		errors: {},
		percentage: 0,
		scaleValue: 1,
		imageSelectionStatus: false,
		imgFileName: "",
		captureStatus: false
	};

	schema = Joi.object({
		thumbnail: Joi.object().required().label("Thumbnail"),
		video: Joi.object().required().label("Video"),
		speedLevel: Joi.string().required().label("Speed level"),
		isPremium: Joi.string().required().label("Premium"),
		duration: Joi.string().required().label("Duration"),
		createdAt: Joi.date()
	});

	handleImageChange = (e) => {

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
							imgFileName: file.name,
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
						thumbnail: "",
						createdAt: new Date()
					},
					thumbnailPreview: null,
				});
				this.setState({ errors: { thumbnail: "The file type ." + e.target.files[0].name.split(".").pop() + " is not supported" } });
			}



		}

	};


	handleVideoChange = (e) => {

		var vid = document.createElement('video');

		if (e.target.files[0] !== undefined) {

			this.setState({
				videoFileChangeURL: e.target.files
			})
			var fileURL = URL.createObjectURL(e.target.files[0]);
			vid.src = fileURL;

			vid.ondurationchange = (e) => {
				this.setState({
					data: {
						...this.state.data,
						duration: Math.round(e.path[0].duration).toString(),
					}
				})
			};


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
						createdAt: new Date()
					},
					videoPreview: URL.createObjectURL(e.target.files[0]),
				});
			} else {
				this.setState({ errors: { video: "The file type ." + e.target.files[0].name.split(".").pop() + " is not supported" } });
			}

		} else {

			if (this.state.videoFileChangeURL !== "") {
				var fileURL = URL.createObjectURL(this.state.videoFileChangeURL[0]);
				vid.src = fileURL;

				vid.ondurationchange = (e) => {
					this.setState({
						data: {
							...this.state.data,
							duration: Math.round(e.path[0].duration).toString(),
						}
					})
				};


				if (
					this.state.videoFileChangeURL[0].name
						.split(".")
						.pop()
						.match(/(mp4|avi)$/)
				) {
					this.setState({
						data: {
							...this.state.data,
							video: this.state.videoFileChangeURL[0],
						},
						videoPreview: URL.createObjectURL(this.state.videoFileChangeURL[0]),
					});
				} else {
					this.setState({ errors: { video: "The file type ." + this.state.videoFileChangeURL[0].name.split(".").pop() + " is not supported" } });
				}
			}
		}


	};

	componentDidMount() {
		Axios.get(`${config.API_URL}/admin/speed`, {
			headers: {
				Authorization: Auth.getToken(),
			},
		}).then((response) => {
			if (response.status === 200) {
				this.setState({
					speedLevels: response.data.data.speedLevel,
				});
			}
		});
	}




	handleSubmit = async () => {

		//upload image

		const { thumbnail, video } = this.state.data;
		let imageData = await Uploader({ file: thumbnail, name: thumbnail.filename, path: 'drills/videos/thumbnails/images' });
		let thumbnailFormData = new FormData();
		thumbnailFormData.append("thumbnail", imageData.url);
		Axios.post(`${config.API_URL}/admin/drills/upload`, thumbnailFormData, {
			headers: {
				Authorization: Auth.getToken(),
				"Content-Type": "multipart/form-data",
			},
		}).then( async (response) => {
			//upload video
			let videoData = await Uploader({ file: video, name: video.filename, path: 'drills/videos/video-files', ref: this });
			let videoFormData = new FormData();
			videoFormData.append("video", videoData.url);
			Axios.post(`${config.API_URL}/admin/drills/upload`, videoFormData, {
				headers: {
					Authorization: Auth.getToken(),
					"Content-Type": "multipart/form-data",
				}
			}).then((videoResponse) => {
				this.setState({
					percentage: 100
				})
				setTimeout(() => {
					this.setState({
						percentage: 0
					})
				}, 1000)
				this.setState({
					data: {
						...this.state.data,
						// video: videoResponse.data.data.videos.video,
						// thumbnail: response.data.data.videos.thumbnail,
						createdAt: new Date()
					},
				});
				this.props.handleAddDrillVideo(this.state.data);
			}).catch((error) => console.log(error));
		}).catch((error) => console.log(error));
	};


	setEditorRef = editor => this.setState({ editor });

	onCrop = (e) => {
		e.preventDefault();
		const { editor } = this.state;
		if (editor !== null) {
			const url = editor.getImageScaledToCanvas().toDataURL();
			const imgfile = this.DataURLtoFile(url, this.state.imgFileName)

			this.setState({

				userProfilePic: url,
				data: {
					...this.state.data,
					thumbnail: imgfile,
				},

				captureStatus: true,

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
		const { data, categories, athletes, speedLevels, errors, thumbnailPreview, videoPreview } = this.state;
		const { percentage } = this.state
		return (
			<Modal show={isAddModalOpen} onHide={onClose} backdrop="static" dialogClassName="modal-90w">
				<form onSubmit={this.handleSubmit}>
					<Modal.Header closeButton>
						<Modal.Title>Drill</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<Row>
							<div className='col-md-12 col-sm-6 col-xs-12 text-center'>
								<div className='form-group'>


									{(this.state.imageSelectionStatus == true) ?
										<div>

											<div style={{
												width: "100%", padding: "10px", border: "3px dashed #1B1D32", marginRight: "20px", marginLeft: "20px", display: "flex", justifyContent: "center", alignItems: "center",
												alignContent: "center", alignSelf: "center"
											}}>



												<div className="row">

													<div className="col-lg-12">
														<AvatarEditor image={this.state.selectedImage} border={30} width={660} height={290} scale={this.state.scaleValue} rotate={0} ref={this.setEditorRef} className="cropCanvas" />
														<input style={{ width: '100%', backgroundColor: "#1B1D32" }} type="range" value={this.state.scaleValue} name="points" min="1" max="10" onChange={this.onScaleChange} className="multi-range" />

													</div>
												</div>



											</div>


											<br />
											<br />

											<div className="row">
												<div className="col-lg-6" >
													<div className="row" style={{ display: "flex", justifyContent: "center", alignItems: "center", alignContent: "center", alignSelf: "center" }}>
														<div>

															{(this.state.userProfilePic === undefined || this.state.userProfilePic === "null" || this.state.userProfilePic === "") ? (
																<img src={uploadIcon} style={{ width: "223", height: "120px" }} />
															) : (
																	<img src={this.state.userProfilePic} style={{ wwidth: "223", height: "120px" }} onError={(e) => { e.target.src = uploadIcon }} />
																)
															}
														</div>
													</div>
													<div className="row">

														<input
															type='file'
															className='form-control'
															style={{ display: "none" }}
															ref={(fileInput) => (this.fileInput = fileInput)}
															onChange={this.handleImageChange}
														/>


														{errors.thumbnail && <span className='text-danger'>{errors.thumbnail}</span>}
														<br />
														<a href='#' className='btn btn-dark' onClick={() => this.fileInput.click()}>
															Upload Thumbnail
																	</a>
														<br />
														<br />

														<button onClick={this.onCrop} className="  btn btn-dark">
															Capture
																	</button>

													</div>
													<br />
													<br />
												</div>
												<div className="col-lg-6" >
													<div className="row" style={{ display: "flex", justifyContent: "center", alignItems: "center", alignContent: "center", alignSelf: "center" }}>



														{videoPreview ? (
															<ReactPlayer url={videoPreview} controls={true} width='223px' height='120px' config={{ file: { attributes: { controlsList: 'nodownload' } } }} />
														) : (
																<img onClick={() => this.videoInput.click()} src={videoIcon} alt='' width='223px' height='120px' />
															)}



													</div>
													<div className="row">
														<input
															type='file'
															className='form-control'
															style={{ display: "none" }}
															ref={(videoInput) => (this.videoInput = videoInput)}
															onChange={this.handleVideoChange}
														/>

														{errors.video && <span className='text-danger'>{errors.video}</span>}
														<br />
														<br />
														<a href='#' className='btn btn-dark' onClick={() => this.videoInput.click()}>
															Upload Video
																		</a>


													</div>

												</div>

											</div>




										</div>


										: ""}



									{(this.state.imageSelectionStatus == false) ?

										<div className="row">

											<div className="col-lg-6 col-xl-6" >

												{(data.thumbnail === undefined || data.thumbnail === "null" || data.thumbnail === "") ? (
													<img onClick={() => this.fileInput.click()} src={uploadIcon} alt='' width='100%' height='255px' style={{ borderRadius: "5px" }} />

												) : (

														<img src={thumbnailPreview} width='100%' height='255px' style={{ borderRadius: "5px" }} onError={(e) => { e.target.src = uploadIcon }} draggable={false} />
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
												<br />
												<br />
												<a href='#' className='btn btn-dark' onClick={() => this.fileInput.click()}>
													Upload Thumbnail
													</a>
												<br />
												<br />
												<br />


											</div>


											<div className="col-lg-6 col-xl-6">

												{videoPreview ? (
													<ReactPlayer url={videoPreview} controls={true} width='100%' height='255px' config={{ file: { attributes: { controlsList: 'nodownload' } } }} />
												) : (
														<img onClick={() => this.videoInput.click()} src={videoIcon} alt='' width='100%' height='255px' />
													)}
												<input
													type='file'
													className='form-control'
													style={{ display: "none" }}
													ref={(videoInput) => (this.videoInput = videoInput)}
													onChange={this.handleVideoChange}
												/>
												{errors.video && <span className='text-danger'>{errors.video}</span>}
												<br />
												<br />
												<a href='#' className='btn btn-dark' onClick={() => this.videoInput.click()}>
													Upload Video
														</a>

												<br />
												<br />
												<br />

											</div>


										</div> : ""}

								</div>
							</div>
						</Row>

						<Row>
							<Col md={5} mdOffset={1}>

								<div className='col-md-12 col-sm-12 col-xs-12'>
									<div className='form-group'>
										<select className='form-control' name='speedLevel' value={data.speedLevel} onChange={this.handleOnChange}>
											<option value=''>Select Speed Level</option>
											{speedLevels && speedLevels.length > 0
												? speedLevels.map((speedLevel, index) => {
													return (
														<option value={speedLevel._id} key={`speedLevel-${index}`}>
															{speedLevel.name}
														</option>
													);
												})
												: ""}
										</select>
										{errors.speedLevelId && <span className='text-danger'>{errors.speedLevelId}</span>}
									</div>
								</div>

							</Col>
							<Col md={5} mdOffset={1} >

								<input type="checkbox" name="isPremium" value={true} onChange={this.handleOnChange} />
								<label style={{ fontSize: '16px', padding: "13px", fontWeight: "400" }} >Premium</label>

							</Col>
						</Row>
						<Row>
							<Col md={10} mdOffset={1} >

								<input className='form-control' name="duration" placeholder='Duration in Seconds' value={data.duration} onChange={this.handleOnChange} disabled style={{ display: "none" }} />
								{percentage > 0 && <ProgressBar now={percentage} active label={`${percentage}%`} />}
							</Col>
						</Row>
					</Modal.Body>
					<Modal.Footer>
						<Button className='btn-dark' type='submit' size='lg' block>
							Add Video
						</Button>
					</Modal.Footer>
				</form>
			</Modal>
		);
	}
}

export default DrillVideoModal;
