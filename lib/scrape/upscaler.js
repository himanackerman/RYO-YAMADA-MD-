import axios from "axios"
import FormData from "form-data"

export const ImgUpscaler = {
  config: {
    uploadUrl: "https://get1.imglarger.com/api/UpscalerNew/UploadNew",
    statusUrl: "https://get1.imglarger.com/api/UpscalerNew/CheckStatusNew",
    agent: "Mozilla/5.0"
  },

  async process(buffer, scale = 2) {
    try {
      if (!buffer) throw "Image buffer diperlukan"

      const form = new FormData()
      form.append("myfile", buffer, {
        filename: "upload.png",
        contentType: "image/png"
      })
      form.append("scaleRadio", scale.toString())

      const { data: uploadRes } = await axios.post(
        this.config.uploadUrl,
        form,
        {
          headers: {
            ...form.getHeaders(),
            Origin: "https://imgupscaler.com",
            Referer: "https://imgupscaler.com/",
            "User-Agent": this.config.agent
          }
        }
      )

      if (uploadRes.code !== 200 || !uploadRes.data?.code) {
        throw "Gagal upload gambar"
      }

      const jobCode = uploadRes.data.code

      for (let i = 0; i < 30; i++) {
        const { data: statusRes } = await axios.post(
          this.config.statusUrl,
          { code: jobCode, scaleRadio: scale },
          {
            headers: {
              "Content-Type": "application/json",
              Origin: "https://imgupscaler.com",
              Referer: "https://imgupscaler.com/",
              "User-Agent": this.config.agent
            }
          }
        )

        if (statusRes.code === 200 && statusRes.data?.status === "success") {
          return statusRes.data.downloadUrls[0]
        }

        await new Promise(res => setTimeout(res, 5000))
      }

      throw "Timeout upscale"

    } catch (e) {
      throw e.toString()
    }
  }
}