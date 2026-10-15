import { BookingStatus } from "@/generated/prisma/enums";
import { canCreateBooking, canApproveBooking, canAddItem, canDeleteItem } from "./permissions";
import { describe, expect, it } from "@jest/globals";

//define admin user object
//allows admin to bypass all checks
describe("canCreateBooking", () => {
    it("allow admin and all users to book items", () => {
    //call the function with the admin user
    const adminUser = {
      name: "alice",
      id: 10,
      email: "alice@gmail.com",
      phone: "797812893",
      password: "pass4",
      isAdmin: true,
      canList: true,
      canBorrow: true
    }
    const item = {
      id: 10,
      ownerId: 11,
      title : "pot",
      description: "metallic",
      dailyRate: 100,
      deletedAt: null
    }
    const isAvailable = true

    const results = canCreateBooking(adminUser,item,isAvailable)
    expect(results).toEqual({ allowed: true})
  })
  //banned user or canBorrow as false
  it("disallow banned user from booking items", () => {
    //call the function with the admin user
    const user = {
      name: "alice",
      id: 10,
      email: "alice@gmail.com",
      phone: "797812893",
      password: "pass4",
      isAdmin: false,
      canList: false,
      canBorrow: false
    }
    const item = {
      id: 10,
      ownerId: 11,
      title : "pot",
      description: "metallic",
      dailyRate: 120,
      deletedAt: null
    }
    const isAvailable = true
    const results = canCreateBooking(user,item,    
    isAvailable)
    expect(results).toEqual({ allowed: false, message: "Cannot borrow, check with admin"})
  })
  it("disallow user from booking item their own", () => {
    //call the function with the admin user
    //item.ownerId !== user.id
    const user = {
      name: "alice",
      id: 10,
      email: "alice@gmail.com",
      phone: "797812893",
      password: "pass4",
      isAdmin: false,
      canList: true,
      canBorrow: true
    }
    const item = {
      id: 10,
      ownerId: 10,
      title : "pot",
      description: "metallic",
      dailyRate: 150,
      deletedAt: null
    }
    const isAvailable = true
    const results = canCreateBooking(user,item,    
    isAvailable)
    expect(results).toEqual({ allowed: false, message: "can't book your own item"})
  })
  it("disallow user from booking unavailable items", () => {
    //call the function with the admin user
    const user = {
      name: "alice",
      id: 10,
      email: "alice@gmail.com",
      phone: "797812893",
      password: "pass4",
      isAdmin: false,
      canList: false,
      canBorrow: true
    }
    const item = {
      id: 10,
      ownerId: 12,
      title : "pot",
      description: "metallic",
      dailyRate: 200,
      deletedAt: null
    }
    const isAvailable = false
    const results = canCreateBooking(user,item,    
    isAvailable)
    expect(results).toEqual({ allowed: false, message: "item is not available for booking"})
  })
  //canBorrow: true
  it("allow booking items they don't own", () => {
    //call the function with the admin user
    const user = {
      name: "alice",
      id: 10,
      email: "alice@gmail.com",
      phone: "797812893",
      password: "pass4",
      isAdmin: false,
      canList: false,
      canBorrow: true
    }
    const item = {
      id: 10,
      ownerId: 11,
      title : "pot",
      description: "metallic",
      dailyRate: 150,
      deletedAt: null
    }
    const isAvailable = true
    const results = canCreateBooking(user,item,    
    isAvailable)
    expect(results).toEqual({ allowed: true})
  })
})

describe("canAddItem", () => {
  it("allow user.admin to add item for listing", () => {
    const adminUser = {
      name: "mac",
      id: 12,
      email: "mac@gmail.com",
      phone: "79781289",
      password: "password4",
      isAdmin: true,
      canList: false,
      canBorrow: false
    }
    const results = canAddItem(adminUser)
    expect(results).toEqual({ allowed: true })
  })
  it("disallow user who cannot list", () => {
    const user = {
      name: "mich",
      id: 12,
      email: "mac@gmail.com",
      phone: "79781289",
      password: "password4",
      isAdmin: false,
      canList: false,
      canBorrow: false
    }
    const results = canAddItem(user)
    expect(results).toEqual({ allowed: false, message: "Only Owners can add new items" })
  })
  it("disallow user who can only borrow", () => {
  const user = {
    name: "mich",
    id: 12,
    email: "mac@gmail.com",
    phone: "79781289",
    password: "password4",
    isAdmin: false,
    canList: false,
    canBorrow: true
  }
  const results = canAddItem(user)
  expect(results).toEqual({ allowed: false, message: "Only Owners can add new items" })
 })
  it("allow user.canList to add item for listing", () => {
    const user = {
      name: "mc",
      id: 12,
      email: "mac@gmail.com",
      phone: "79781289",
      password: "password4",
      isAdmin: false,
      canList: true,
      canBorrow: false
    }
    const results = canAddItem(user)
    expect(results).toEqual({ allowed: true })
  })
})

describe("bookingapproval", () => {
  it("approve booking an item by admin", () => {
    const user = {
      name: "thomas",
      id: 10,
      email: "thomas@gmail.com",
      phone: "7978893",
      password: "pss4",
      isAdmin: true,
      canList: true,
      canBorrow: false
    }
    const item = {
      id: 11,
      ownerId: 10,
      title : "lights",
      description: "metallic",
      dailyRate: 150,
      deletedAt: null
    }
    const booking = {
      id: 1,
      itemId: 11,
      borrowerId: 11,
      status: BookingStatus.PENDING,
      startDate: new Date("2026-10-11"),
      endDate: new Date("2026-10-13"),
      dailyRate: 100,
      returnedAt: new Date("2026-10-14"),
      decisionNote: null
    }
    const reslts = canApproveBooking(user, item, booking)
    expect(reslts).toEqual({ allowed: true })
  })
    it("approve booking an item by canlist user", () => {
    const user = {
      name: "thomas",
      id: 10,
      email: "thomas@gmail.com",
      phone: "7978893",
      password: "pss4",
      isAdmin: false,
      canList: true,
      canBorrow: false
    }
    const item = {
      id: 11,
      ownerId: 10,
      title : "lights",
      description: "metallic",
      dailyRate: 800,
      deletedAt: null
    }
    const booking = {
      id: 1, 
      itemId: 11,
      borrowerId: 11,
      status: BookingStatus.PENDING,
      startDate: new Date("2026-10-11"),
      endDate: new Date("2026-10-13"),  
      dailyRate: 100,                   
      returnedAt: new Date("2026-10-14"),
      decisionNote: null
    }
    const reslts = canApproveBooking(user, item, booking)
    expect(reslts).toEqual({ allowed: true })
  })
    it("disapprove booking an item by canBorrow user", () => {
    const user = {
      name: "thomas",
      id: 10,
      email: "thomas@gmail.com",
      phone: "7978893",
      password: "pss4",
      isAdmin: false,
      canList: false,
      canBorrow: true
    }
    const item = {
      id: 11,
      ownerId: 10,
      title : "lights",
      description: "metallic",
      dailyRate: 200,
      deletedAt: null
    }
    const booking = {
      id: 1, 
      itemId: 11,
      borrowerId: 11,
      status: BookingStatus.PENDING,
      startDate: new Date("2026-10-11"),
      endDate: new Date("2026-10-13"),  
      dailyRate: 100,                   
      returnedAt: new Date("2026-10-14"),
      decisionNote: null
    }
    const reslts = canApproveBooking(user, item, booking)
    expect(reslts).toEqual({ allowed: false, message: 'Only owners can approve this booking'})
  })
    it("disapprove booking an item item they don't own", () => {
    const user = {
      name: "thomas",
      id: 11,
      email: "thomas@gmail.com",
      phone: "7978893",
      password: "pss4",
      isAdmin: false,
      canList: true,
      canBorrow: true
    }
    const item = {
      id: 11,
      ownerId: 10,
      title : "lights",
      description: "metallic",
      dailyRate: 200,
      deletedAt: null
    }
    const booking = {
      id: 1, 
      itemId: 11,
      borrowerId: 11,
      status: BookingStatus.PENDING,
      startDate: new Date("2026-10-11"),
      endDate: new Date("2026-10-13"),  
      dailyRate: 100,                   
      returnedAt: new Date("2026-10-14"),
      decisionNote: null
    }
    const reslts = canApproveBooking(user, item, booking)
    expect(reslts).toEqual({ allowed: false, message: "one can only approve the items that they own" })
  })
  it("disapprove booking an item status =APPROVED, != PENDING", () => {
    const user = {
      name: "thomas",
      id: 10,
      email: "thomas@gmail.com",
      phone: "7978893",
      password: "pss4",
      isAdmin: false,
      canList: true,
      canBorrow: true
    }
    const item = {
      id: 11,
      ownerId: 10,
      title : "lights",
      description: "metallic",
      dailyRate: 120,
      deletedAt: null
    }
    const booking = {
      id: 1, 
      itemId: 11,
      borrowerId: 11,
      status: BookingStatus.APPROVED,
      startDate: new Date("2026-10-11"),
      endDate: new Date("2026-10-13"),  
      dailyRate: 100,                   
      returnedAt: new Date("2026-10-14"),
      decisionNote: null
    }
    const reslts = canApproveBooking(user, item, booking)
    expect(reslts).toEqual({ allowed: false,  message:'This booking has already been processed!'})
  })
  it("disapprove booking an item, bkingstatus =REJECTED", () => {
    const user = {
      name: "thomas",
      id: 10,
      email: "thomas@gmail.com",
      phone: "7978893",
      password: "pss4",
      isAdmin: false,
      canList: true,
      canBorrow: true
    }
    const item = {
      id: 11,
      ownerId: 10,
      title : "lights",
      description: "metallic",
      dailyRate: 399,
      deletedAt: null
    }
    const booking = {
      id: 1, 
      itemId: 11,
      borrowerId: 11,
      status: BookingStatus.REJECTED,
      startDate: new Date("2026-10-11"),
      endDate: new Date("2026-10-13"),  
      dailyRate: 100,                   
      returnedAt: new Date("2026-10-14"),
      decisionNote: null
    }
    const reslts = canApproveBooking(user, item, booking)
    expect(reslts).toEqual({ allowed: false,  message:'This booking has already been processed!'})
  })
  it("approve booking an item for all ideal cases", () => {
    const user = {
      name: "thomas",
      id: 10,
      email: "thomas@gmail.com",
      phone: "7978893",
      password: "pss4",
      isAdmin: false,
      canList: true,
      canBorrow: true
    }
    const item = {
      id: 11,
      ownerId: 10,
      title : "lights",
      description: "metallic",
      dailyRate: 200,
      deletedAt: null
    }
    const booking = {
      id: 1, 
      itemId: 11,
      borrowerId: 11,
      status: BookingStatus.PENDING,
      startDate: new Date("2026-10-11"),
      endDate: new Date("2026-10-13"),  
      dailyRate: 100,                   
      returnedAt: new Date("2026-10-14"),
      decisionNote: null
    }
    const reslts = canApproveBooking(user, item, booking)
    expect(reslts).toEqual({ allowed: true })
  })
})

describe("allow deletion of an item from listing:", () => {
  it("admin to delete item:", () => {
    const user = {
      name: "mike",
      id: 10,
      email: "alice@gmail.com",
      phone: "797812893",
      password: "pass4",
      isAdmin: true,
      canList: false,
      canBorrow: false
    }
    const item = {
      id: 10,
      ownerId: 10,
      title : "pot",
      description: "metallic",
      dailyRate: 200,
      deletedAt: null
    }
    const isAvailable = true
    const results = canDeleteItem(user, item, isAvailable)
    expect(results).toEqual({ allowed: true })
  })
  it("canlist user to delete item:", () => {
    const user = {
      name: "mike",
      id: 10,
      email: "alice@gmail.com",
      phone: "797812893",
      password: "pass4",
      isAdmin: false,
      canList: true,
      canBorrow: false
    }
    const item = {
      id: 10,
      ownerId: 10,
      title : "pot",
      description: "metallic",
      dailyRate: 209,
      deletedAt: null
    }
    const isAvailable = true
    const results = canDeleteItem(user, item, isAvailable)
    expect(results).toEqual({ allowed: true })
  })
  it("disallow canBorrow user to delete item:", () => {
    const user = {
      name: "mike",
      id: 10,
      email: "alice@gmail.com",
      phone: "797812893",
      password: "pass4",
      isAdmin: false,
      canList: false,
      canBorrow: true
    }
    const item = {
      id: 10,
      ownerId: 10,
      title : "pot",
      description: "metallic",
      dailyRate: 300,
      deletedAt: null
    }
    const isAvailable = true
    const results = canDeleteItem(user, item, isAvailable)
    expect(results).toEqual({allowed: false, message:'Only Owners can delete this item'})
  })
  it("disallow deletion for items they don't own:", () => {
    const user = {
      name: "mike",
      id: 14,
      email: "alice@gmail.com",
      phone: "797812893",
      password: "pass4",
      isAdmin: false,
      canList: true,
      canBorrow: true
    }
    const item = {
      id: 10,
      ownerId: 10,
      title : "pot",
      description: "metallic",
      dailyRate: 300,
      deletedAt: null
    }
    const isAvailable = true
    const results = canDeleteItem(user, item, isAvailable)
    expect(results).toEqual({ allowed: false, message: 'you can only delete your own item'})
  })
  it("disallow deletion for booked item", () => {
    const user = {
      name: "mike",
      id: 10,
      email: "alice@gmail.com",
      phone: "797812893",
      password: "pass4",
      isAdmin: false,
      canList: true,
      canBorrow: true
    }
    const item = {
      id: 10,
      ownerId: 10,
      title : "pot",
      description: "metallic",
      dailyRate: 300,
      deletedAt: null
    }
    const isAvailable = false
    const results = canDeleteItem(user, item, isAvailable)
    expect(results).toEqual({ allowed: false, message: 'Cannot delete a booked item' })
  })
  it("allow deletion for all ideal cases", () => {
    const user = {
      name: "mike",
      id: 10,
      email: "alice@gmail.com",
      phone: "797812893",
      password: "pass4",
      isAdmin: false,
      canList: true,
      canBorrow: true
    }
    const item = {
      id: 10,
      ownerId: 10,
      title : "pot",
      description: "metallic",
      dailyRate: 300,
      deletedAt: null
    }
    const isAvailable = true
    const results = canDeleteItem(user, item, isAvailable)
    expect(results).toEqual({ allowed: true })
  })
})

describe("canCreateBooking availability", () => {
  const admin = { id: 1, name: "alice", phone: "797812893", email: "alice@gmail.com", password: "pass4", isAdmin: true, canList: true, canBorrow: true }
  const item = { id: 1, ownerId: 2, title: "drill", description: "light use", dailyRate: 150, deletedAt: null }

  it("admin cannot book dates that are taken", () => {
    expect(canCreateBooking(admin, item, false)).toEqual({ allowed: false, message: "item is not available for booking" })
  })
  it("admin can still book free dates", () => {
    expect(canCreateBooking(admin, item, true)).toEqual({ allowed: true })
  })
})