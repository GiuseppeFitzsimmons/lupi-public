const User=require('lupi-dal/User');
const Role = require('lupi-dal/Role');
const tokenUtility=require('token-utility');
const Brand = require('lupi-dal/Brand');
const Collection = require('lupi-dal/Collection')
const Product = require('lupi-dal/Product')
const Variation = require('lupi-dal/Variation')
const VariationComponent = require('lupi-dal/VariationComponent')
const VariationSizeModifier = require('lupi-dal/VariationSizeModifier')
const ProductSize = require('lupi-dal/ProductSize')
const Size = require('lupi-dal/Size')
const Composition = require('lupi-dal/Composition')
const Fabric = require('lupi-dal/Fabric')
const Supplier = require('lupi-dal/Supplier')
const Contact = require('lupi-dal/Contact')
const Fabricant = require('lupi-dal/Fabricant')
const PerUnitProductionCost = require('lupi-dal/PerUnitProductionCost')
const Customer = require('lupi-dal/Customer')
const Order = require('lupi-dal/Order')
const OrderVariation = require('lupi-dal/OrderVariation')

process.env.ENVIRONMENT='dev';
process.env.RUNNING_LOCAL_REGION='us-east-1'
process.env.REGION='us-east-1'
process.env.HASHING_SECRET='A HASHING SECRET'
process.env.SIGNING_SECRET='A SIGNING SECRET'

const event={
    httpMethod:'post',
    body:"",
    queryStringParameters:{},
    headers:{}
}
let
    brand,
    collection,
    product,
    variation,
    variationComponent,
    variationSizeModifier,
    productSize,
    size,
    composition,
    fabric,
    supplier,
    fabricant,
    perUnitProductionCost,
    customer,
    order,
    orderVariation,
    contact,
    mockBrandId,
    mockCollectionId,
    mockProductId,
    mockProductSizeId

const setup = async()=>{
    console.log('mocks setup started')
    User.template.id='___impossibleId@lupi.fr';
    User.template.firstName='Bob';
    User.template.lastName='Smith';
    User.template.password=tokenUtility.hashAPass('password');
    console.log('User', User.template)
    let user = await User.save(User.template);
    console.log('User saved', user)

    delete Brand.template.id;
    Brand.template.brandName='Chez Bob';
    Brand.template.siret='CCCCE';
    Brand.template.addressLine1='12 Main Street';
    Brand.template.addressLine2='First Floor';
    Brand.template.postalCode='75004';
    Brand.template.clientPaymentConditions='30 days, 5%';
    Brand.template.operatingCurrency='EU';
    Brand.template.roundingRules='2';
    brand=await Brand.save(Brand.template);
    mockBrandId = brand.id+''

    delete Collection.template.id
    Collection.template.brandId = brand.id
    Collection.template.collectionName = 'testCollection0'
    collection = await Collection.save(Collection.template)
    mockCollectionId = collection.id+''

    delete Product.template.id
    Product.template.collectionId = collection.id
    Product.template.productName = 'testProduct0'
    Product.template.metrage = '10'
    Product.template.price = '10e'
    Product.template.perUnitProductionCostId = 'TODO: add perUnitProductionCost (added but it`s a circular dependency)'
    product = await Product.save(Product.template)
    mockProductId = product.id+''

    delete Variation.template.id
    Variation.template.productId = product.id
    Variation.template.variationName = 'testVariation0'
    Variation.template.productId = product.id
    Variation.template.productionCost = '5e'
    variation = await Variation.save(Variation.template)

    delete Composition.template.id
    Composition.template.productId = product.id
    Composition.template.variationId = variation.id
    Composition.template.logos = 'logo.png'
    Composition.template.funText = 'this text is fun'
    Composition.template.madeIn = 'Pakistan'
    composition = await Composition.save(Composition.template)

    delete Contact.template.id
    Contact.template.name='Mikka'
    Contact.template.email='mikka@gmail.com'
    Contact.template.phoneNumber='+3367891234'
    Contact.template.supplierId='TODO Circular dependency'
    contact = await Contact.save(Contact.template)

    delete Supplier.template.id
    Supplier.template.name='Fabric Supplier 0'
    Supplier.template.contactId=contact.id
    Supplier.template.fabricId='TODO Circular dependency'
    Supplier.template.surcharge='10'
    supplier = await Supplier.save(Supplier.template)

    delete Fabricant.template.id
    Fabricant.template.name='fabricant0'
    Fabricant.template.contactId=contact.id
    Fabricant.template.madeIn='Indonesia'
    fabricant = await Fabricant.save(Fabricant.template)

    delete Fabric.template.id
    Fabric.template.name='Silk'
    Fabric.template.pricedMethod='yes'
    Fabric.template.price='8'
    Fabric.template.currency='Euro'
    Fabric.template.surchargedPrice='10'
    Fabric.template.supplierId=supplier.id;
    Fabric.template.compositionId=composition.id
    Fabric.template.brandId=brand.id
    fabric = await Fabric.save(Fabric.template)

    delete VariationComponent.template.id
    VariationComponent.template.productId = variation.id
    VariationComponent.template.fabricId = fabric.id
    VariationComponent.template.quantity = '10'
    VariationComponent.template.fabricantId = fabricant.id
    variationComponent = await VariationComponent.save(VariationComponent.template)

    delete VariationSizeModifier.template.id
    VariationSizeModifier.template.variationComponentId = variationComponent.id
    VariationSizeModifier.template.quantity = '3'
    VariationSizeModifier.template.size = '5'
    variationSizeModifier = await VariationSizeModifier.save(VariationSizeModifier.template)

    delete Size.template.id
    Size.template.productId = product.id
    Size.template.collectionId = collection.id
    size = await Size.save(Size.template)

    delete ProductSize.template.id
    ProductSize.template.productId = product.id
    ProductSize.template.sizeId = size.id
    productSize = await ProductSize.save(ProductSize.template)
    mockProductSizeId = productSize.id+''

    delete PerUnitProductionCost.template.id
    PerUnitProductionCost.template.fabricantId = fabricant.id
    PerUnitProductionCost.template.productId = product.id
    PerUnitProductionCost.template.currency = 'euro'
    perUnitProductionCost = await PerUnitProductionCost.save(PerUnitProductionCost.template)

    delete Customer.template.id
    Customer.template.name='customer0'
    Customer.template.contactId=contact.id
    Customer.template.markup='3'
    Customer.template.shippingAddress='62, Rue Custine, 75018 Paris'
    Customer.template.businessAddress='10, Rue de Trétaigne, 75018 Paris'
    Customer.template.siret='siret0'
    Customer.template.paymentConditions='N/A'
    customer = await Customer.save(Customer.template)

    delete Order.template.id
    Order.template.customerId=customer.id
    Order.template.date=new Date().getTime();
    order = await Order.save(Order.template)

    delete OrderVariation.template.id
    OrderVariation.template.orderId=order.id
    OrderVariation.template.variationId=variation.id
    OrderVariation.template.quantity='10'
    OrderVariation.template.size='large'
    //orderVariation = await OrderVariation.save(OrderVariation.template)
    //console.log('ERRORTAG',orderVariation)

    let role=Object.assign(Role.template, Role.roles.ADMIN);
    console.log('user', user)
    role.userId=user.id;
    role.brandId=brand.id;
    Role.save(role);

    let tokens=tokenUtility.generateNewPair(User.template.id, '*', [role]);

    console.log('RETURNING SUPPLIER', supplier)
    return {
        tokens,
        user,
        brand,
        collection,
        product,
        variation,
        variationSizeModifier,
        variationComponent,
        size,
        productSize,
        composition, 
        fabric,
        supplier,
        contact,
        fabricant,
        perUnitProductionCost,
        customer,
        order,
        orderVariation,
        contact
    };
}
const teardownAfterTimeout = async () => {
    console.log('teardownAfterTimeout running')
    let roles=await Role.getRolesForUser('___impossibleId@lupi.fr');
    for (let r=0;r<roles.length;r++) {
        let role=roles[r];
        await Role.remove(role);
        await Brand.remove(role.brandId);
    }
    await Brand.remove(mockBrandId);
    await Collection.remove(mockCollectionId);
    await Product.remove(mockProductId);
    await Variation.remove(variation.id);
    await VariationSizeModifier.remove(variationSizeModifier.id);
    await VariationComponent.remove(variationComponent.id);
    await Size.remove(size.id);
    await ProductSize.remove(mockProductSizeId);
    await Composition.remove(composition.id);
    await Fabric.remove(fabric.id);
    await Supplier.remove(supplier.id);
    await Contact.remove(contact.id);
    await Fabricant.remove(fabricant.id);
    await PerUnitProductionCost.remove(perUnitProductionCost.id);
    await Customer.remove(customer.id);
    await Order.remove(order.id);
    //await OrderVariation.remove(orderVariation.id);
}

const teardown = async()=>{
    console.log('teardown running')
    //setTimeout(teardownAfterTimeout, 10000)
    await teardownAfterTimeout()
}
module.exports={
    event,
    setup,
    teardown
}