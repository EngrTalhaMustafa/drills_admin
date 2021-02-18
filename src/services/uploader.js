import axios from 'axios';
import config from '../config';
const Uploder = (params) => {
  return new Promise(async (res, rej) => {
    try {
      const { file, name, path = '', ref = null } = params;
      console.log(file, name)
      if (!file || !name) {
        rej('Missing Params')
      }
      let fileParts = name.split('.');
      let fileName = fileParts[0];
      let fileType = fileParts[1];
      console.log("Preparing the upload");
      let response = await axios.put(
        `${config.API_URL}/upload`,
        {
          path,
          fileType: fileType
        }
      );
      console.log(response)
      const { signedRequest, url } = response.data.data;
      console.log("Recieved a signed request " + signedRequest);

      // Put the fileType in the headers for the upload
      const options = {
        headers: {
          'Content-Type': fileType
        },
        ...ref && {
          onUploadProgress: (progressEvent) => {
            const { loaded, total } = progressEvent;
            let percent = Math.floor((loaded * 100) / total)
            ref.setState({
              percentage: percent
            })
          }
        }
      };
      axios.put(signedRequest, file, options)
        .then(result => {
          console.log("Response from s3", result)
          res({ ...result, url })
        })
        .catch(e => { throw e })
    } catch (error) {
      console.log(error)
      rej(error)
    }
  });

}

export default Uploder;