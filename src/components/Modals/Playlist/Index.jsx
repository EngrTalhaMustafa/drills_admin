import React, { Component } from "react";
import Form from "../../common/Form";
import { Button, Modal } from "react-bootstrap";
import Joi from "joi";
import Axios from "axios";
import Auth from "../../Services/Auth";
import config from "config";
import uploadIcon from "../../../assets/img/uploadImg.png";
import AvatarEditor from 'react-avatar-editor';
import { toast } from "react-toastify";


class PlaylistModal extends Form {
	state = {
		data: {
			name: "",
			thumbnail: "",
		},
		errors: {},
		disableButton: false,
		userProfilePic: '',
		editor: null,
		scaleValue: 1,
		imageSelectionStatus: false,
		imgFileName:"",
		captureStatus: false
	};

	schema = Joi.object({
		name: Joi.string().required().label("Name").min(3),
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
					});
				  this.setState({ errors: { thumbnail: "The file type ." + e.target.files[0].name.split(".").pop() + " is not supported" } });
			  }



		}

	};




	doSubmit = () => {
		const { data } = this.state;
		let playlistData = new FormData();
		playlistData.append("name", data.name);
		playlistData.append("thumbnail", data.thumbnail);
		Axios.post(`${config.API_URL}/admin/playlist`, playlistData, {
			headers: {
				Authorization: Auth.getToken(),
				"Content-Type": "multipart/form-data",
			},
		}).then((playlistResponse) => {

				if (playlistResponse.status === 200) {
					toast.success("Playlist has been create successfully.");
					this.props.handleAddPlaylist();
				}
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
		const { data, errors, disableButton } = this.state;
		return (
			<Modal show={isAddModalOpen} onHide={onClose} backdrop="static" dialogClassName="modal-60w">
				<form onSubmit={this.handleSubmit}>
					<Modal.Header closeButton>
						<Modal.Title>Playlist</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<div className='form-group'>
							<input type='text' className='form-control' name='name' placeholder='Enter Name' onChange={this.handleOnChange} value={data.name} />
							{errors.name && <span className='text-danger'>{errors.name}</span>}
						</div>

						<div className='form-group'>
						{(this.state.imageSelectionStatus == true)?
												<div>
														
														<div style={{width:"100%", padding:"10px", border: "3px dashed #1B1D32",  display: "flex", justifyContent: "center", alignItems: "center", 
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
															<div className="col-lg-8 col-sm-6" >
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
															<div className="col-lg-4 col-sm-6" style={{display: "flex", justifyContent: "center", flexDirection:"column", alignItems: "center", alignContent: "center", alignSelf:"center"}}>
																<input
																type='file'
																className='form-control'
																style={{ display: "none" }}
																ref={(fileInput) => (this.fileInput = fileInput)}
																onChange={this.handleImageChange}
																/>

																

																{errors.thumbnail && <span className='text-danger'>Thumbnail must be a JPG/PNG picture</span>}
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
													
													<div style={{width:"100%", padding:"10px", flexDirection:"column", display: "flex", justifyContent: "center", alignItems: "center", 
														alignContent: "center", alignSelf:"center"}}>
														
															{(this.state.userProfilePic === undefined || this.state.userProfilePic === "null" || this.state.userProfilePic === "") ? (
																<img src={uploadIcon} style={{ width: "500px", height: "250px"}}  />
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
															<br/>
															{errors.thumbnail && <span className='text-danger'>Thumbnail must be a JPG/PNG picture</span>}
															<br/>
															<br/>
															<a href='#' className='btn btn-dark' onClick={() => this.fileInput.click()}>
																Upload Thumbnail
															</a>
	
													</div> : "" }


						</div>

					</Modal.Body>
					<Modal.Footer>
						<Button className='btn-dark' size='lg' type='submit' block>
							Add Playlist
						</Button>
					</Modal.Footer>
				</form>
			</Modal>
	
	
	);
	}
}

export default PlaylistModal;
