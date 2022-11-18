export const datasDummy = [
  {
    type: 'image',
    width: 80,
    height: 80,
    x: 100,
    y: 120,
    url: 'https://hashsnap-static.s3.ap-northeast-2.amazonaws.com/file/200420_fc_seoul/sticker6.png'
  },
  {
    type: 'rect',
    width: 150,
    height: 150,
    x: 300,
    y: 200,
    style: '#f00f00',
  },
  {
    type: 'image',
    width: 100,
    height: 100,
    x: 300,
    y: 40,
    url: 'https://hashsnap-static.s3.ap-northeast-2.amazonaws.com/file/200420_fc_seoul/sticker9.png'
  }
]

export const getImage = url => new Promise(res => {
  const img = new Image
  img.onload = () => res(img)
  img.src = url
})

// const imageData = await createImageData('https://hashsnap-static.s3.ap-northeast-2.amazonaws.com/file/200420_fc_seoul/sticker9.png')    
// datas.push(imageData)

export const createImageData = async(url) => {
  const image = await getImage(url)
  const data = {
    type: 'image',
    width: 100,
    height: 100,
    x: 300,
    y: 40,
    image: image
  }
  return data
}