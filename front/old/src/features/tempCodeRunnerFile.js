                let x=[{id:1},{id:2}]
                let y =[{id:1},{id:3}]
                y.forEach(brand=>{
                  if (!x.find(b=>b.id===brand.id)) {
                    x.push(brand)
                  }
                })
                console.log(x)