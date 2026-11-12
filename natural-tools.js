// Natural v1: independent material layer, shared by held models and inventory icons.
(() => {
  const cells = [], materials = [];
  let ready = false, pending;
  const tileFor = color => ({
    '#8a5a2c': 0, '#6e4420': 1,
    '#9a968e': 2, '#bcb8ae': 2, '#6c6a66': 2,
    '#cdd6e2': 3, '#f4f8fc': 3, '#8f9cac': 3,
    '#c9a23a': 4, '#3a2a1a': 5,
  })[color.toLowerCase()];
  window.NaturalTools = {
    material(index) { return ready ? materials[index] : null; },
    load() {
      if (pending) return pending;
      pending = new Promise((resolve, reject) => {
        const image = new Image();
        image.onerror = () => { pending = null; reject(new Error('工具材质加载失败')); };
        image.onload = () => {
          for (let i = 0; i < 6; i++) {
            const c = document.createElement('canvas'); c.width = c.height = 256;
            c.getContext('2d').drawImage(image, i % 3 * image.width / 3, Math.floor(i / 3) * image.height / 2, image.width / 3, image.height / 2, 0, 0, 256, 256);
            cells.push(c);
            const map = new THREE.CanvasTexture(c); map.anisotropy = 4;
            const material=new THREE.MeshPhongMaterial({ map, shininess: 3, specular: 0x151515 });
            if(i===3 || i===4)MetalFinish.apply(material,i===4);
            materials.push(material);
          }
          ready = true; resolve();
        };
        image.src = 'texture-packs/natural-v1/tools-source.png';
      });
      return pending;
    },
    mesh(list, makeGeometry, fallback) {
      if (!ready) return new THREE.Mesh(makeGeometry(list), fallback);
      const geometry = makeGeometry(list), colors = geometry.attributes.color;
      list.forEach((part, i) => {
        const tile = tileFor(part[6]);
        geometry.addGroup(i * 36, 36, tile === undefined ? 6 : tile);
        if (tile !== undefined) for (let j = i * 36; j < (i + 1) * 36; j++) colors.setXYZ(j, 1, 1, 1);
      });
      return new THREE.Mesh(geometry, [...materials, fallback]);
    },
    drawPart(ctx, color, x, y, w, h) {
      const tile = tileFor(color);
      if (!ready || tile === undefined) return false;
      ctx.drawImage(cells[tile], x, y, w, h); return true;
    },
  };
})();
